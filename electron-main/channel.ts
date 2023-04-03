// handle openai api
import {BrowserWindow, ipcMain, Notification} from "electron"
import ConfigHelper from "../electron-preload/config";
import AssistantService from "../electron-preload/openai/assistant.service";

export default class ChannelListener {
    assistantService: AssistantService;

    constructor(private readonly win: BrowserWindow) {
        console.log('channel listener created')
        this.assistantService = new AssistantService((chunk: string) => {
            process.stdout.write(chunk);
        });
    }

    init() {
        ipcMain.on("init-openai-client", () => {
            console.log("web content ready, trying to init openai client");
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
                this.assistantService.assistantSteamHandler = (chunk: string) => {
                    event.sender.send("openai-completion-reply", chunk);
                }
                const answer = await this.assistantService.askQuestion(question);
                event.sender.send("openai-completion-reply", `[Done]: ${answer}`);

            } catch (e: any) {
                event.sender.send("openai-completion-reply", `[Error]: ${e.message}`);
                new Notification({title: 'Request Failure', body: e.message, silent: true}).show();
            }
        })


    }
}