import * as fs from "fs";
import * as readline from "readline";
import {Logger} from "../common/logger";
import {ChatCompletionRequestMessage} from "openai/api";

const os = require("os");
const user = os.userInfo();
const md5 = require("md5");

export const chatLogFileSavePath = `${user.homedir}/.cp-advisor`;

export class SessionHelper {
    static logger = new Logger();

    constructor() {
    }

    private static getLogFilePath(sessionId: String) {
        return `${chatLogFileSavePath}/chat-${sessionId}.log`;
    }

    /**
     * create new session and return a session id (hash string)
     */
    static async createSession() {
        // create new session and write to the chat log file
        const sessionId: string = md5(`${user.username}_${new Date().getTime()}`);
        return sessionId;
    }


    static async getSessionHistoriesFromChatFile(sessionId: string): Promise<string[]> {
        // use node stream to read and search session start index in chat log file
        const inStream = fs.createReadStream(this.getLogFilePath(sessionId), "utf-8");
        const readLine = readline.createInterface(inStream);
        const histories: string[] = [];

        const logger = this.logger;
        return await new Promise((resolve, reject) => {
            try {
                let chunk: string[] = [];
                readLine.on("line", (line: string) => {
                    const roleMatch = line.match(/^(a|u)=/);
                    if (roleMatch && roleMatch.length > 0 && chunk.length > 0) {
                        histories.push(chunk.join("\n"));
                        chunk = [line];
                    } else {
                        if (line.trim().length > 0) chunk.push(line);
                    }
                }).on("close", function () {
                    histories.push(chunk.join("\n"));
                    chunk = [];
                    resolve(histories);
                }).on("error", (err: any) => {
                    logger.error(`get session histories err`, err);
                });
            } catch (e: any) {
                this.logger.error(e.message);
                reject(e);
            }
        });

    }

    static async updateChatSession(sessionId: string, messages: string[]): Promise<void | Error> {
        let writeStream: fs.WriteStream = fs.createWriteStream(this.getLogFilePath(sessionId), {encoding: "utf-8", flags: "a"});
        const chunk: string = ["", ...messages].join("\n");
        return new Promise((resolve, reject) => {
            writeStream.write(chunk, (error: any) => {
                if (error) {
                    this.logger.error(error.message, error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

export class Session {
    private _id: string = "";

    histories: string[];
    logger: Logger;

    get id() {
        return this._id;
    }

    constructor() {
        this.histories = [];
        this.logger = new Logger();
    }

    async start() {
        this._id = await SessionHelper.createSession();
        this.logger.info(`[${this._id}] session start.`);
    }

    async userPrompt(message: string) {
        this.logger.info(`[${this._id}] user: ${message}`);
        await SessionHelper.updateChatSession(this._id, [`u=${message}`]);
        this.histories = await SessionHelper.getSessionHistoriesFromChatFile(this._id);
    }

    async assistantAnswer(message: string) {
        this.logger.debug(`[${this._id}] assistant: ${message}`);
        await SessionHelper.updateChatSession(this._id, [`a=${message}`]);
        this.histories = await SessionHelper.getSessionHistoriesFromChatFile(this._id);
    }

    get contextMessages(): ChatCompletionRequestMessage[] {
        const his: string[] = JSON.parse(JSON.stringify(this.histories));
        const messages: ChatCompletionRequestMessage[] = [];
        let messageLength = 0;
        his.map(item => {
            messageLength += item?.substring(2).length;
            if (messageLength > 200) {
                messageLength -= messages[0].content.length;
                messages.splice(0, 1);
            }
            messages.push({role: item?.startsWith("u=") ? "user" : "assistant", content: item?.substring(2)});

        });
        this.logger.debug(`context messages: ${JSON.stringify(messages, undefined, 2)}`);
        return messages;
    }
}

