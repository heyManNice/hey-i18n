type HeyI18nConfig = {
    i18nFiles: Record<string, () => Promise<unknown>>;
    sourcesLocale: string;
    defaultLocale: 'system' | string;
}

// @ts-ignore
const configFile = (import.meta.glob('/hey-i18n.config.ts', { eager: true })['/hey-i18n.config.ts'] as { default: HeyI18nConfig })?.default ?? {};

const config = {
    // @ts-ignore
    i18nFiles: configFile.i18nFiles || import.meta.glob('/i18n/*.json') || {},
    sourcesLocale: configFile.sourcesLocale || 'en-US',
    defaultLocale: configFile.defaultLocale || 'system',
};

export default config;

export function defineConfig(config: Partial<HeyI18nConfig>) {
    return config;
}