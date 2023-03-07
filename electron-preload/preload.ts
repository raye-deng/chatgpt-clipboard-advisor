import os from "os";
import {ipcRenderer, contextBridge, ipcMain} from "electron";
import ChannelListener from "../electron-main/channel";
import {call} from "axios";
import ConfigHelper from "./config";

console.log("platform", os.platform());


contextBridge.exposeInMainWorld("openAIClient", {
    complete: (prompt: string, callback: (answer: string) => {}): void => {
        ipcRenderer.on("openai-completion-reply", (event, answer) => {
            console.log(`received completion: ${answer}`);
            callback(answer);
        });
        console.log(`reply listener registered`);
        ipcRenderer.send("openai-complete", prompt);
        console.log(`send complete event: ${prompt}`);

    },
    checkOpenAIKey: (callback: (result: boolean) => {}) => {
        callback(ConfigHelper.needToSetKey());
    },
    setOpenAIKey: (key: string) => {
        ipcRenderer.send("openai-save-key", key);
    },
    initOpenAIClient:()=>{
        ipcRenderer.send("init-openai-client");
    },
    minusWindow:()=>{
        ipcRenderer.send("window-minus");
    },
    maximizeWindow:()=>{
        ipcRenderer.send("window-maximize");
    }
})