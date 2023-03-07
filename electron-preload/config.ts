import * as fs from "fs";
import {ipcRenderer} from "electron";
import path from "path";
import os from "os";

const CONFIG_FILE_PATH = `/Users/${os.userInfo({encoding: "utf-8"}).username}/.cp-advisor/config.json`;
export default class ConfigHelper {
    constructor() {
    }
    static needToSetKey() {
        this.createConfigFileIfNotExist();
        const config = JSON.parse(fs.readFileSync(path.resolve(CONFIG_FILE_PATH)).toString());
        if (!config.openaiKey) {
            return true;
        }
        return false;
    }

    static getOpenAIKey() {
        this.createConfigFileIfNotExist();
        const config = JSON.parse(fs.readFileSync(path.resolve(CONFIG_FILE_PATH)).toString());
        if (!config.openaiKey) {
            ipcRenderer?.sendSync("openai-set-key");
            return;
        }
        console.log(`openai key loaded: ${config.openaiKey}`)
        return config.openaiKey;

    }

    static saveOpenAIKey(key: string) {
        this.createConfigFileIfNotExist();
        // save open api key to file .cp-advisor/config.json
        fs.writeFileSync(path.resolve(CONFIG_FILE_PATH), JSON.stringify({openaiKey: key}));
        console.log(`openai key saved: ${key}`);
    }

    private static isConfigFileExist() {
        return fs.existsSync(path.resolve(CONFIG_FILE_PATH.substring(0, CONFIG_FILE_PATH.lastIndexOf("/")))) && fs.existsSync(path.resolve(CONFIG_FILE_PATH));
    }

    private static createConfigFileIfNotExist() {
        if (!this.isConfigFileExist()) {
            fs.mkdirSync(path.resolve(CONFIG_FILE_PATH.substring(0, CONFIG_FILE_PATH.lastIndexOf("/"))))
            fs.writeFileSync(path.resolve(CONFIG_FILE_PATH), "{}");
        }
    }
}