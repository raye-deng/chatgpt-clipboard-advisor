import {clipboard, globalShortcut, Notification} from "electron";
import Client from "../src/utils/openai";
import ConfigHelper from "../electron-preload/config";
import AssistantService from "../electron-preload/openai/assistant.service";

let openaiClient: Client;
const assistantService = new AssistantService((chunk: string) => {
    process.stdout.write(chunk);
});
export const addShortCutListener = () => {
    // 注册一个'CommandOrControl+X' 快捷键监听器
    globalShortcut.unregisterAll();
    const ret = globalShortcut.register('CommandOrControl+Q', async () => {
        console.log('CommandOrControl+Q is pressed')
        await submitClipboardQuestion();
    })

    if (!ret) {
        console.log('registration failed')
    }

    new Notification({
        title: "快捷键监听已启用",
        body: "您可以在复制文本后，通过Command/Ctrl + Q来向OpenAI请求建议"
    }).show();
}

const submitClipboardQuestion = async () => {
    const thinkingNotification = new Notification({title: "Advisor", body: "稍等，我思考一下."});
    const question = readClipboardQuestion();
    if (!openaiClient) {
        openaiClient = getClient();
    }
    thinkingNotification.show();
    assistantService.assistantSteamHandler = (chunk: string) => {
        process.stdout.write(chunk);
        thinkingNotification.body += chunk;
        thinkingNotification.show();
    }
    assistantService.askQuestion(question).then((answer: string) => {
        clipboard.writeText(answer, "clipboard");
        const notification = new Notification({title: "Advisor", body: "我已经将建议放到你的粘贴板了，粘贴一下试试。"});
        notification.show();
    }).catch((error) => {
        console.log(`submit questions error: ${JSON.stringify(error)}`);
        new Notification({title: "发生错误", body: `从OpenAI获取建议发生了错误，${error.message}`}).show();
    })
}

export const getClient = () => {
    return new Client(ConfigHelper.getOpenAIKey());
}
const readClipboardQuestion = () => {
    const text = clipboard.readText("clipboard");
    console.log(`reading clipboard: ${text}`);
    return text;
}