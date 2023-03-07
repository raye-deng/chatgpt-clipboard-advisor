import {ClientRequest, net} from "electron";

export default class Client {
    baseURL: string = "https://openai-api.proxy.dengfs.cn/v1";

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

    async complete(prompt: string, model: string = "gpt-3.5-turbo"): Promise<any> {
        console.log(`completing prompt: ${prompt} with model: ${model}...`);
        const ps = new Promise((resolve, reject) => {
            const request: ClientRequest = net.request({
                method: 'POST',
                url: `${this.baseURL}/chat/completions`,
                protocol: 'https:',
                redirect:"follow"
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
        return result.choices[0]?.message?.content;
    }
}