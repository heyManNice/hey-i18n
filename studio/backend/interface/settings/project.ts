import config from '../../services/config';

// 读取项目的i18n配置
export async function getI18nConfig() {
    return await config.getI18nConfig();
}

// 写入项目的i18n配置
export async function setI18nConfig(cfg: Parameters<typeof config.setI18nConfig>[0]) {
    await config.setI18nConfig(cfg);
}
