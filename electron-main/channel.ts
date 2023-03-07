// handle openai api
import {BrowserWindow, ipcMain, ipcRenderer, Notification} from "electron"
import Client from "../src/utils/openai";
import {getClient} from "./listener";
import ConfigHelper from "../electron-preload/config";

export default class ChannelListener {
    private client: Client;

    constructor(private readonly win: BrowserWindow) {
        console.log('channel listener created')
    }

    init() {
        ipcMain.on("init-openai-client", () => {
            console.log("web content ready, trying to init openai client");
            this.client = getClient();
            this.listen();
        })
        ipcMain.on("openai-save-key", (event, key) => {
            console.log(`received openai-save-key event with key: ${key}`)
            ConfigHelper.saveOpenAIKey(key);
        })
        ipcMain.on("window-minus", () => {
            if (this.win.resizable) {
                this.win.setSize(180, 130, true);
                this.win.setPosition(60, 60, true);
            }
        })
        ipcMain.on("window-maximize", () => {
            if (this.win.resizable) {
                this.win.setSize(800, 600, true);
                this.win.center();
            }
        })
    }

    private listen() {
        ipcMain.on("openai-complete", async (event, question) => {
            try {
                console.log(`received openai-complete event with question: ${question}`);
                const answer = await this.client.complete(question);
                event.sender.send("openai-completion-reply", answer);
                console.log(`send answer to sender: ${answer}`);
            } catch (e: any) {
                new Notification({title: '请求失败', body: e.message, silent: true}).show();
            }
        })


    }
}