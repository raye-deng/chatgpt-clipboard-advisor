import {globalShortcut, clipboard, Notification} from "electron";
import Client from "../src/utils/openai";

import clipboardy from 'clipboardy';
import ConfigHelper from "../electron-preload/config";

let openaiClient: Client;
export const addShortCutListener = () => {
    // 注册一个'CommandOrControl+X' 快捷键监听器
    console.log('registering CommandOrControl+Q')
    const ret = globalShortcut.register('CommandOrControl+Q', async () => {
        console.log('CommandOrControl+Q is pressed')
        await submitClipboardQuestion();
    })

    if (!ret) {
        console.log('registration failed')
    }

    // 检查快捷键是否注册成功
    console.log('is registered: ', globalShortcut.isRegistered('CommandOrControl+Q'));
    new Notification({
        title: "快捷键监听已启用",
        body: "您可以在复制文本后，通过Command/Ctrl + Q来向OpenAI请求建议"
    }).show();
}

const submitClipboardQuestion = async () => {
    new Notification({title: "Advisor", body: "稍等，我思考一下."}).show();
    const question = readClipboardQuestion();
    if (!openaiClient) {
        openaiClient = getClient();
    }
    const answer = await openaiClient.complete(question);
    console.log(`answer: ${answer}`);
    clipboard.writeText(answer, "clipboard");
    new Notification({title: "Advisor", body: "我已经将建议放到你的粘贴板了，粘贴一下试试。"}).show();
}

export const getClient = () => {
    return new Client(ConfigHelper.getOpenAIKey());
}
const readClipboardQuestion = () => {
    const text = clipboard.readText("clipboard");
    console.log(`reading clipboard: ${text}`);
    return text;
}