// @ts-ignore
const configFile = (import.meta.glob('/hey-i18n.config.ts', { eager: true })['/hey-i18n.config.ts'] as { default: HeyI18nConfig })?.default ?? {};

type HeyI18nConfig = {
    i18nFiles: Record<string, () => Promise<unknown>>;
    sourcesLocale: string;
    defaultLocale: 'system' | string;
}

export function defineConfig(config: Partial<HeyI18nConfig>): HeyI18nConfig {
    return {
        // @ts-ignore
        i18nFiles: config.i18nFiles || import.meta.glob('/i18n/*.json') || {},
        sourcesLocale: config.sourcesLocale || 'zh-CN',
        defaultLocale: config.defaultLocale || 'system',
    };
}

console.log(configFile);

const locales = Object.entries(configFile.i18nFiles).reduce((acc, [path, module]) => {
    const locale = path.split('/').pop()?.split('.').shift();
    if (locale) {
        acc[locale] = module;
    }
    return acc;
}, {} as {
    [locale: string]: () => Promise<unknown>;
});

function getSystemLocale(): string {
    return navigator.language || document.documentElement.lang || 'en-US';
}

let currentLocale = localStorage.getItem('hey-i18n-locale') || (configFile.defaultLocale === 'system' ? getSystemLocale() : configFile.defaultLocale);

console.log('当前语言：', currentLocale);


const importfunc = locales[currentLocale] as () => Promise<{
    default: Record<string, string>;
}>;

const locale = importfunc ? (await importfunc()).default as Record<string, string> : {};

console.log('语言内容：', locale);

/**
 * i18n template tag function
 * @param strings 
 * @returns string
 * @example const greeting = T`Hello, World!`;
 */
export default function T(strings: TemplateStringsArray): string {
    const key = strings[0] as string;
    return locale[key] ?? key;
}