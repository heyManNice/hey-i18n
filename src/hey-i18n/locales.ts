import config from './config';

const locales = Object.entries(config.i18nFiles).reduce((acc, [path, module]) => {
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

let currentLocale = localStorage.getItem('hey-i18n-locale') || (config.defaultLocale === 'system' ? getSystemLocale() : config.defaultLocale);

console.log('当前语言：', currentLocale);


const importfunc = locales[currentLocale] as () => Promise<{
    default: Record<string, string>;
}>;

export const locale = importfunc ? (await importfunc()).default as Record<string, string> : {};

console.log('语言内容：', locale);