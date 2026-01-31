type HeyI18nConfig = {
    i18nFiles: Record<string, () => Promise<unknown>>;
    sourcesLocale: string;
    defaultLocale: 'system' | string;
}

// @ts-ignore
const configFile = (import.meta.glob('/i18n/.hey-i18n-config', { eager: true })['/i18n/.hey-i18n-config'] as { default: HeyI18nConfig })?.default ?? {};

const config = {
    // @ts-ignore
    i18nFiles: import.meta.glob('/i18n/*.json') || {},
    sourcesLocale: configFile.sourcesLocale || 'en-US',
    defaultLocale: configFile.defaultLocale || 'system',
} as HeyI18nConfig;

export default config;