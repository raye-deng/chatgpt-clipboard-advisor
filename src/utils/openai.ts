import {ClientRequest, net, Notification} from "electron";
import ConfigHelper from "../../electron-preload/config";

type Message = { role: string, content: string }
type AssistantType = {
    [key: string]: { name: string, model?: string, roleDefinedMessages: Message[] },
}
const assistant: AssistantType = {
    "r": {
        name: "chatbot",
        roleDefinedMessages: [
            {
                role: "user",
                content: "now we start an new session. you will be a chatbot, you can chat with me. In your response, you can reply with any content you want."
            }
        ]
    },
    "t": {
        name: "translator",
        roleDefinedMessages: [
            {
                role: "user",
                content: "now, we start an new session. you will be a translator, you can translate the text from Chinese to English or English to Chinese. In your response, you will only return the translated text."
            },
            {
                role: "assistant",
                content: "I am a translator, I will translate the text from Chinese to English or English to Chinese you provide to me. In my response, I will only return the translated text."
            }
        ]
    },
    "d": {
        name: "document optimizer",
        roleDefinedMessages: [
            {
                role: "user",
                content: "now, we start an new session. you will be a document optimization assistant. you can optimize the text content you send me, make adjustments such as spell check, layout formatting, grammar correction, and wording optimization. In your response, you will return the optimized result and also you will provide a list of the different between result and origin text."
            },
            {
                role: "assistant",
                content: "I am now a document optimization assistant. I will optimize the text content you send me, make adjustments such as spell check, layout formatting, grammar correction, and wording optimization, in my response, I will return the optimized result and also I will provide a list of the different between result and origin text. all content will bash on the origin text language ."
            }]
    },
    "c": {
        name: "code helper",
        roleDefinedMessages: [
            {
                role: "user",
                content: "now, we start an new session. you will be a coding assistant. you can provide codes or optimize suggestions based on the text or code you provide me. In your response, you will only reply with codes and annotate the key points in the codes without any other content."
            },
            {
                role: "assistant",
                content: "I am a coding assistant. I will provide codes or optimize suggestions based on the text or code you provide me. I will only reply with codes and annotate the key points in the codes without any other content."
            }]
    }
}
export default class Client {
    baseURL: string = ConfigHelper.getOpenAIHost();

    messages: Message[] = [];

    defaultOptions: any;

    // cli: ChatGPTCLI | null = null;

    constructor(private readonly apiKey: string) {
        console.log(`openai client created with api key: ${apiKey}`);
        // create openai axios instance
        this.defaultOptions = {
            followRedirect: true,
            maxRedirectCount: 20,
            timeout: 0,
            size: 0,
            headers: {}
        };

    }

    async complete(prompt: string, model: string = ConfigHelper.getOpenAIModel(), streamHandler: (chunk: string) => void): Promise<any> {
        [prompt, model] = this.beforeComplete(prompt, model);
        console.log(`completing prompt: ${prompt} with model: ${model}...`);
        this.messages.push({role: "user", content: prompt});
        const ps = new Promise((resolve, reject) => {
            console.log(`requesting: ${this.baseURL}/chat/completions`);
            const request: ClientRequest = net.request({
                method: 'POST',
                url: `${this.baseURL}/chat/completions`,
                protocol: 'https:',
                redirect: "follow"
            })

            request.setHeader('Content-Type', 'application/json')
            request.setHeader('Authorization', `Bearer ${this.apiKey}`)
            request.setHeader("responseType", "stream")
            request.on("error", (error: any) => {
                console.log(`request error: ${error}`);
                reject(error);
            });
            request.on("response", (response) => {
                response.on("data", (chunk) => {
                    streamHandler(chunk.toString());
                })
                response.on("end", () => {
                    console.log(`response end: ${response.statusCode}`);
                })
                response.on("error", (error: any) => {
                    console.log(`response error: ${error}`);
                    reject(error);
                });
            })

            request.write(JSON.stringify({
                model: model,
                stream: true,
                messages: this.messages
            }), "UTF-8", () => {
                console.log("write completed, completions request sent: ", prompt);
            });

            request.end();
        })
        const result: any = await ps;
        if (result.error) {
            console.log(`request completions error: ${JSON.stringify(result.error.message)}`);
            await Promise.reject(result.error);
            return;
        }
        console.log(`usage info: ${JSON.stringify(result.usage, undefined, 2)}`);
        this.messages.push(result.choices[0]?.message);
        return result.choices[0]?.message?.content;
    }

    beforeComplete(prompt: string, model: string = ConfigHelper.getOpenAIModel()): [string, string] {
        console.log(`completing prompt: ${prompt} with model: ${model}...`);
        Object.keys(assistant).map((key: string) => {
            if (prompt.startsWith(`${key}:`) || prompt.startsWith(`${key.toUpperCase()}:`)) {
                prompt = prompt.replace(`${key}:`, "").replace(`${key.toUpperCase()}:`, "");
                if (assistant[key].model !== undefined) {
                    model = assistant[key].model + "";
                }
                this.messages = assistant[key].roleDefinedMessages;
                new Notification({title: "角色变更", body: `接收指令成功，我将切换成${assistant[key].name}`}).show();
            }
        })
        return [prompt, model];
    }
}