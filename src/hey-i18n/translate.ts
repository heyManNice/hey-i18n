import { locale } from './locales';

function formatTranslation(template: string, values: any[]): string {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof values[index] !== 'undefined' ? values[index] : match;
    });
}

export default function translate(strings: TemplateStringsArray, ...values: any[]): string {
    const key = strings.join('{}');

    const translated = locale[key];
    if (translated) {
        return formatTranslation(translated, values);
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