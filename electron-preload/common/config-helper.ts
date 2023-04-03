import {Logger} from "./logger";

const fs = require("fs");
const os = require('os');

const user = os.userInfo();
export const CONFIG_UNIX_FILE_PATH = `${user.homedir}/.cp-advisor/config.json`;


export type Config = {
    //odin env configurations
    env?: "prod" | "test",
    openaiAPIHost: string,
    model: string,
    openaiKey: string,
    debuggable?: boolean
}
export default class ConfigHelper {
    static logger: Logger = new Logger();

    static getConfig(): Config {
        if (!fs.existsSync(CONFIG_UNIX_FILE_PATH)) {
            throw new Error(`config not found!`);
        }
        return this.readConfigFromFile();
    }

    private static readConfigFromFile(): Config {
        try {
            const config = fs.readFileSync(CONFIG_UNIX_FILE_PATH, "utf8");
            return JSON.parse(config) as Config;
        } catch (e: any) {
            throw new Error(`read config from  ${CONFIG_UNIX_FILE_PATH} failed,error message:${e.message}`);
        }
    }

    /**
     * save config in user home path ~/.config/odin-cli/config.json
     * @param config
     */
    static async saveConfig(config: Config) {
        try {
            const folder = CONFIG_UNIX_FILE_PATH?.substring(0, CONFIG_UNIX_FILE_PATH.lastIndexOf("/"));
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, {recursive: true})
                this.logger.debug(`create odin cli config folder:${folder}`);
            }
            fs.rmSync(CONFIG_UNIX_FILE_PATH);
            fs.writeFileSync(CONFIG_UNIX_FILE_PATH, JSON.stringify(config, undefined, 2), {flag: "w+"})
            this.logger.info(`update configuration success, file store in ${CONFIG_UNIX_FILE_PATH}`);
        } catch (e: any) {
            throw new Error(`save config into path ${CONFIG_UNIX_FILE_PATH} failed,error message:${e.message}`);
        }
    }

}