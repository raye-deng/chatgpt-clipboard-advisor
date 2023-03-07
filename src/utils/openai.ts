import {ClientRequest, net} from "electron";
import ConfigHelper from "../../electron-preload/config";

type Message = { role: string, content: string }
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
        console.log(`completing prompt: ${prompt} with model: ${model}...`);
        const ps = new Promise((resolve, reject) => {
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
                messages: [{role: "user", content: prompt}]
            }), "UTF-8", () => {
                console.log("write completed, completions request sent: ", prompt);
            });

            request.end();
        })
        const result: any = await ps;

        console.log(`usage info: ${JSON.stringify(result.usage, undefined, 2)}`);

        return result.choices[0]?.message?.content;
    }
}