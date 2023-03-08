import {ClientRequest, net, Notification} from "electron";
import ConfigHelper from "../../electron-preload/config";

type Message = { role: string, content: string }
type AssistantType = {
    [key: string]: { name: string, model?: string, roleDefinedMessages: Message[] },
}
const assistant: AssistantType = {
    "t": {
        name: "translator",
        roleDefinedMessages: [{
            role: "assistant",
            content: "I am a translator, I will only response translated result in English."
        }
        ]
    },
    "d": {
        name: "document optimizer",
        roleDefinedMessages: [{role: "assistant", content: "I am a document optimizer, I will optimize the format, grammar, and spelling of the text you provide, and provide you with the results which comment the different parts of the text. My reply will only contain the optimized text and comments, nothing else."}]
    },
    "c": {
        name: "code helper",
        roleDefinedMessages: [{
            role: "assistant",
            content: "I am a code optimization assistant, you can give me a piece of code and I will try to provide some optimized code with comments or you can also tell me what language you want to use by `${language}:${description}` To implement the described requirements, my reply will only contain code and comments, nothing else."
        }]
    }
}
export default class Client {
    baseURL: string = ConfigHelper.getOpenAIHost();

    messages: Message[] = [];

    defaultOptions: any;

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

    async complete(prompt: string, model: string = ConfigHelper.getOpenAIModel()): Promise<any> {
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
            request.on("error", (error: any) => {
                console.log(`request error: ${error}`);
                reject(error);
            });
            request.on("response", (response) => {
                response.on("data", (chunk) => {
                    console.log(chunk.toString());
                    resolve(JSON.parse(chunk.toString()));
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