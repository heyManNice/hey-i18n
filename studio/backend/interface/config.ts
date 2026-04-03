import config from "../services/config";


// 初始化i18n配置
export async function initConfig(sourcesLocale: string) {
    await config.initConfigDir(sourcesLocale);
}