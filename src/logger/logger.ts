export class Logger {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    private log(status: "INFO" | "WARN" | "ERROR" | "DEBUG", logMethod: (message?: any, ...optionalParams: any[]) => void, ...args: any[]) {
        logMethod(`[${new Date().toISOString()}] [${this.name}:${status}] `, ...args)
    }
    private createLogLevelMethod(status: "INFO" | "WARN" | "ERROR" | "DEBUG") {
        let logMethod: (message?: any, ...optionalParams: any[]) => void;
        switch(status) {
            case "DEBUG":
                logMethod = console.debug;
                break;
            case "INFO":
                logMethod = console.info;
                break;
            case "WARN":
                logMethod = console.warn;
                break;
            case "ERROR":
                logMethod = console.error;
                break;
        }
        return (...args: any[]) => this.log(status, logMethod, ...args);
    }
    info = this.createLogLevelMethod("INFO");
    warn = this.createLogLevelMethod("WARN");
    error = this.createLogLevelMethod("ERROR");
    debug = this.createLogLevelMethod("DEBUG");
}

export const globalLog = new Logger("📖 Storymaker")
