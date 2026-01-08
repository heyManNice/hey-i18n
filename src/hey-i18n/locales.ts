import config from './config';

class Locales {
    // 语言包映射
    private locales: Record<string, () => Promise<unknown>>;
    // 当前语言
    private currentLocale: string;
    // 当前语言包内容
    public messages: Record<string, string> = {};

    constructor(i18nFiles: Record<string, () => Promise<unknown>>) {
        // 构建 locale 映射
        this.locales = Object.entries(i18nFiles).reduce((acc, [path, module]) => {
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
        console.log('当前语言：', this.currentLocale);
    }

    // 获取系统语言
    private getSystemLocale(): string {
        return navigator.language || document.documentElement.lang || 'en-US';
    }

    // 加载语言包
    public async loadLocale() {
        const importfunc = this.locales[this.currentLocale] as () => Promise<{
            default: Record<string, string>;
        }>;
        this.messages = importfunc ? (await importfunc()).default as Record<string, string> : {};

        console.log('语言内容：', this.messages);
    }
}

const localesInstance = new Locales(config.i18nFiles);

// 等待语言包加载完成
await localesInstance.loadLocale();

export const messages = localesInstance.messages;