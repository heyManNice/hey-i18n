import config from './config';

import { Locale, rtlLocales } from './languages';

type PluralCategories = 'zero' | 'one' | 'two' | 'few' | 'many';
// other 已经强制在 MessageValue 第一层显示

export type MessageValue = {
    // other 文本片段数组
    texts: string[];
    // other 变量索引数组
    varIndexes: number[];
    // 是否是复数
    isPlural?: boolean;
    // 复数变量索引
    pluralVarIndex?: number;
    // 复数类别
    pluralCategory?: {
        [key in PluralCategories]?: {
            texts: string[];
            varIndexes: number[];
        }
    };
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
        // 更新当前语言的标记
        document.documentElement.lang = this.currentLocale;
    }

    // 获取系统语言
    private getSystemLocale(): string {
        return navigator.language || 'en-US';
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
export function switchLocale(locale: string, reload = true) {

    switch (locale) {
        case currentLocale:
            return;

        case 'system':
            localStorage.removeItem('hey-i18n-locale');
            if (reload) {
                location.reload();
            }
            break;

        default:
            if (availableLocales.includes(locale as Locale)) {
                localStorage.setItem('hey-i18n-locale', locale);
                if (reload) {
                    location.reload();
                }
            } else {
                console.warn(`Locale "${locale}" is not available.`);
            }
    }
}

// 是否为从右到左书写的语言
export const isRtlLocale = rtlLocales.has(currentLocale);

// 自动设置HTML的dir属性和添加对应的CSS类名
if (typeof document !== 'undefined') {
    if (isRtlLocale) {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.classList.remove('ltr');
        document.documentElement.classList.add('rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.classList.remove('rtl');
        document.documentElement.classList.add('ltr');
    }
}