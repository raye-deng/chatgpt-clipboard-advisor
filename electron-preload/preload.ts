import os from "os";
import {contextBridge, ipcRenderer} from "electron";
import ConfigHelper from "./config";


console.log(`os: ${os.platform()}, expose openai client to renderer process.`);


contextBridge.exposeInMainWorld("openAIClient", {
    complete: (prompt: string, callback: (answer: string) => {}): void => {
        ipcRenderer.on("openai-completion-reply", (event, answer) => {
            callback(answer);
        });
        ipcRenderer.send("openai-complete", prompt);
    },
    checkOpenAIKey: (callback: (result: boolean) => {}) => {
        callback(ConfigHelper.needToSetKey());
    },
    setOpenAIKey: (key: string) => {
        ipcRenderer.send("openai-save-key", key);
    },
    initOpenAIClient: () => {
        ipcRenderer.send("init-openai-client");
    },
    minusWindow: () => {
        ipcRenderer.send("window-minus");
    },
    maximizeWindow: () => {
        ipcRenderer.send("window-maximize");
    }
})