import {Logger} from "../common/logger";
import {Session} from "../session";
import ConfigHelper, {Config} from "../common/config-helper";
import {ClientRequest, net} from "electron";

export default class AssistantService {

    logger: Logger;
    currentSession: Session | null = null;
    config: Config;
    assistantSteamHandler: (chunk: any, ...args: any) => void;

    constructor(assistantSteamHandler?: (chunk: any, ...args: any) => void) {
        this.logger = new Logger();
        this.config = ConfigHelper.getConfig();
        this.logger.info(`assistant service created.`);
        this.assistantSteamHandler = assistantSteamHandler || ((chunk: any, ...args: any) => {
            console.log("assistant stream handler: ", chunk);
        });
    }

    set assistantStreamHandler(handler: (chunk: any, ...args: any) => void) {
        this.assistantStreamHandler = handler;
    }

    async askQuestion(question: string): Promise<string> {
        try {
            if (!this.currentSession) {
                this.currentSession = new Session();
                await this.currentSession.start();
            }
            await this.currentSession?.userPrompt(question);
            const ps = new Promise((resolve, reject) => {
                console.log(`requesting: ${this.config.openaiAPIHost}/chat/completions`);
                const request: ClientRequest = net.request({
                    method: 'POST',
                    url: `${this.config.openaiAPIHost}/chat/completions`,
                    protocol: 'https:',
                    redirect: "follow"
                })

                request.setHeader('Content-Type', 'application/json')
                request.setHeader('Authorization', `Bearer ${this.config.openaiKey}`)
                request.setHeader("responseType", "stream")
                request.on("error", (error: any) => {
                    console.log(`request error: ${error}`);
                    reject({error});
                });
                request.on("response", async (response) => {
                    const result = await this.handleChatStream(response, this.assistantSteamHandler);
                    response.on("end", () => {
                        console.log(`response end: ${response.statusCode} message:${response?.statusMessage}`);
                        if (response.statusCode !== 200) {
                            switch (response.statusCode) {
                                case 401:
                                    resolve({error: new Error("Unauthorized")});
                                    break;
                                case 429:
                                    resolve({error: new Error("Too Many Requests")});
                                    break;

                            }
                            return;
                        }
                        resolve(result)
                    })
                    response.on("error", (error: any) => {
                        console.log(`response error: ${error}`);
                        reject({error});
                    });
                })

                request.write(JSON.stringify({
                    model: this.config.model,
                    stream: true,
                    messages: this.currentSession?.contextMessages
                }), "UTF-8", () => {
                    console.log("write completed, completions request sent: ", question);
                });

                request.end();
            })
            const result: any = await ps;
            if (result.error) {
                console.log(`request completions error: ${JSON.stringify(result.error.message)}`);
                throw result.error;
            }
            console.log(`usage info: ${JSON.stringify(result.usage, undefined, 2)}`);
            await this.currentSession?.assistantAnswer(result);
            return result;
        } catch (e: any) {
            this.logger.error(e);
            return Promise.reject(e);
        }
    }

    async handleChatStream(chat: any, streamHandler?: (chunk: any, ...args: any) => void): Promise<string> {
        if (!this.currentSession) {
            throw new Error("current session is null")
        }

        const emit = streamHandler ? streamHandler : (chunk: string) => {
            process.stdout.write(`\x1b[33m\x1b[89m${chunk}`, "utf-8");
        };

        return await new Promise((resolve, reject) => {
            try {
                let result = "";
                (<any>chat).on("data", (data: any) => {
                    if (data.indexOf("[DONE]")) {
                        emit(`[DONE]`);
                        return resolve(result);
                    }
                    const lines = data?.toString()?.split("\n").filter((line: string) => line.trim() !== "");
                    for (const line of lines) {
                        const message = line.replace(/^data: /, "");


                        try {
                            let token = JSON.parse(message)?.choices?.[0]?.delta.content;
                            if (token) {
                                result += token;
                                process.stdout.write(`\x1b[33m\x1b[89m${token}`, "utf-8");
                                emit(`${token?.replace(/(\n|\r)/g, "")}`);
                            }
                        } catch (e: any) {
                            this.logger.error(message, e);
                            reject(e);
                        }

                    }
                });
            } catch (e: any) {
                this.logger.error(e.message, e);
                reject(e);
            }
        });
    }
}