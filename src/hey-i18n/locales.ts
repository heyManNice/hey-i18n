import config from './config';

import type { Locale } from './languages';

//t: 翻译字符串数组
//v: 变量索引数组
export type MessageValue = {
    t: string[];
    v: number[];
};

class Locales {
    // 语言包映射
    private locales: Record<string, () => Promise<unknown>>;
    // 当前语言
    private currentLocale: string;
    // 当前语言包内容
    public messages: Record<string, MessageValue> = {};

    constructor() {
        // 构建 locale 映射
        this.locales = Object.entries(config.i18nFiles).reduce((acc, [path, module]) => {
            const locale = path.split('/').pop()?.split('.').shift();
            if (locale) {
                acc[locale] = module;
            }
            return acc;
        }, {} as {
            [locale: string]: () => Promise<unknown>;
        });

        // 确定当前语言
        this.currentLocale = localStorage.getItem('hey-i18n-locale') || (config.defaultLocale === 'system' ? this.getSystemLocale() : config.defaultLocale);
    }

    // 获取系统语言
    private getSystemLocale(): string {
        return navigator.language || document.documentElement.lang || 'en-US';
    }

    // 加载语言包
    public async loadLocale() {
        const importfunc = this.locales[this.currentLocale] as () => Promise<{
            default: Record<string, MessageValue>;
        }>;
        this.messages = importfunc ? (await importfunc()).default as Record<string, MessageValue> : {};
    }

    // 获取当前可用语言列表
    public getAvailableLocales() {
        return Array.from(new Set([...Object.keys(this.locales), config.sourcesLocale])) as Locale[];
    }

    // 获取当前语言
    public getCurrentLocale(): string {
        return this.currentLocale;
    }
}

const localesInstance = new Locales();

// 等待语言包加载完成
await localesInstance.loadLocale();

// 当前语言包内容
export const messages = localesInstance.messages;

// 当前可用语言列表
export const availableLocales = localesInstance.getAvailableLocales();

// 当前语言
export const currentLocale = localesInstance.getCurrentLocale();

// 项目原文语言
export const sourcesLocale = config.sourcesLocale;

// 切换语言
export function switchLocale(locale: string) {

    switch (locale) {
        case currentLocale:
            return;

        case 'system':
            localStorage.removeItem('hey-i18n-locale');
            location.reload();
            break;

        default:
            if (availableLocales.includes(locale as Locale)) {
                localStorage.setItem('hey-i18n-locale', locale);
                location.reload();
            } else {
                console.warn(`Locale "${locale}" is not available.`);
            }
    }
}