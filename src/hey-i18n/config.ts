type HeyI18nConfig = {
    i18nFiles: Record<string, () => Promise<unknown>>;
    sourcesLocale: string;
    defaultLocale: 'system' | string;
};

// @ts-expect-error import.meta.glob 为 Vite 特有 API，由消费方编译期转换
const configModules = import.meta.glob('/i18n/.hey-i18n-config', { eager: true }) as Record<
    string,
    { default: HeyI18nConfig }
>;
const configFile = configModules['/i18n/.hey-i18n-config']?.default ?? {};

const config = {
    // @ts-expect-error import.meta.glob 为 Vite 特有 API，由消费方编译期转换
    i18nFiles: import.meta.glob('/i18n/*.json') || {},
    sourcesLocale: configFile.sourcesLocale || 'en-US',
    defaultLocale: configFile.defaultLocale || 'system',
} as HeyI18nConfig;

export default config;
