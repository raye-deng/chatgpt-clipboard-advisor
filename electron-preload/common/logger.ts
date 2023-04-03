const os = require("os");
import log from 'electron-log';

export class Logger {
    private readonly instance: log.Logger | any;

    public constructor() {
        const colorize = {
            levels: {
                info: 0,
                debug: 1,
                warning: 2,
                error: 3,
                prompt: 4,
                chat: 5
            },
            colors: {
                debug: "blue",
                info: "green",
                warning: "yellow",
                error: "red",
                prompt: "cyan",
                chat: "magenta"
            }
        };
        const isDebugMode = process.env.debuggable || false;
        this.instance = log.create({logId: 'cp-advisor'});
        // winston.addColors(colorize.colors);
        // const customizedFormat = winston.format.printf((args: any) => `${args.message}`);
        // const format = winston.format.combine(customizedFormat, winston.format.colorize({message: true}));
        // const level = isDebugMode ? "debug" : "info";
        // const transports = [
        // new winston.transports.Console({format})];

        // this.instance = winston.createLogger({level, levels: colorize.levels, format, transports});
    }

    public log(message: string) {
        this.instance.info(message);
    }

    public info(message: string) {

        this.instance.info(message);
    }

    public warn(message: string, ex?: any) {
        this.instance.warning(message);
    }

    public debug(message: string) {
        this.instance.debug(message);
    }

    public error(message: string, error: Error = new Error()) {
        this.instance.debug(`[error]${message} ${error ? error.stack : ""}`);
    }

    public chat(message: string) {
        this.instance.log("chat", message);
    }

    public prompt(message: string) {
        this.instance.prompt(message);
    }
}
