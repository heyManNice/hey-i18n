import project from "./project";
import path from "path";
import fs from "fs";

// i18n 配置接口
type I18nConfig = {
    sourcesLocale: string; // 源语言
    defaultLocale: string; // 用户初始语言，默认为 system，表示跟随系统
}

class ConfigService {
    private configFilePath = path.join(project.getWorkspacePath(), 'i18n', '.hey-i18n-config');

    // 获取项目的 i18n 配置
    public async getI18nConfig() {
        if (!fs.existsSync(this.configFilePath)) {
            throw new Error('i18n config file not found');
        }
        const configContent = fs.readFileSync(this.configFilePath, 'utf-8');
        // 解析配置文件内容，提取出 JSON 部分
        const match = configContent.match(/export default\s+({[\s\S]*});?/);
        if (!match) {
            throw new Error('Invalid i18n config file format');
        }
        const configJson = match[1];
        return JSON.parse(configJson) as I18nConfig;
    }

    // 写入项目的 i18n 配置
    public async setI18nConfig(config: I18nConfig) {
        const content = `//该文件是自动生成的，请在hey-i18n-studio中修改。\nexport default ${JSON.stringify(config, null, 4)};`;
        fs.writeFileSync(this.configFilePath, content, 'utf-8');
    }
}


export default new ConfigService();
