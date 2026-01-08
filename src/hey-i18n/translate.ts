import { locale } from './locales';

export default function translate(strings: TemplateStringsArray, ...values: any[]): string {
    const key = strings.join('{}');

    const translated = locale[key];
    if (translated) {
        return translated;
    }

    // 匹配不到翻译的时候
    let result = '';
    for (let i = 0; i < strings.length; i++) {
        result += strings[i];
        if (i < values.length) {
            result += values[i];
        }
    }
    return result;
}