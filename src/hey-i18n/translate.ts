import { messages } from './locales';
import type { MessageValue } from './locales';

function formatTranslation(messageValue: MessageValue, values: any[]): string {
    const [strs, varIndexes] = messageValue;

    const parts: string[] = [];
    for (let i = 0; i < strs.length; i++) {
        parts.push(strs[i]);
        if (varIndexes && i < varIndexes.length) {
            parts.push(String(values[varIndexes[i]]));
        }
    }
    return parts.join('');
}


export default function translate(strings: TemplateStringsArray, ...values: any[]): string {
    const key = strings.join('');

    const translatedConfig = messages[key];
    if (translatedConfig) {
        return formatTranslation(translatedConfig, values);
    }

    // 匹配不到翻译的时候
    const parts: string[] = [];
    for (let i = 0; i < strings.length; i++) {
        parts.push(strings[i]);
        if (i < values.length) {
            parts.push(String(values[i]));
        }
    }
    return parts.join('');
}