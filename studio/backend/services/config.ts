import project from "./project";
import path from "path";
import fs from "fs";

class ConfigService {
    private configFilePath: string;
    constructor() {
        this.configFilePath = path.join(project.getWorkspacePath(), 'i18n', '.hey-i18n-config');
    }


    public async getConfig() {
        if (!fs.existsSync(this.configFilePath)) {
            throw new Error('Config file does not exist.');
        }
        const configMoudule = (await import('file://' + this.configFilePath));
        if (!configMoudule || !configMoudule.default) {
            throw new Error('Invalid config file.');
        }
        return configMoudule.default as {
            sourcesLocale: string;
            defaultLocale: 'system' | string;
        };
    }
}


export default new ConfigService();
