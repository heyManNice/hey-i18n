import { messages } from './locales';
import type { MessageValue } from './locales';

function formatTranslation(messageValue: MessageValue, values: any[]): string {
    const strs = messageValue.t;
    const varIndexes = messageValue.v;

    let result = '';
    for (let i = 0; i < strs.length; i++) {
        result += strs[i];
        if (varIndexes && i < varIndexes.length) {
            result += values[varIndexes[i]];
        }
    }
    return result;
}


export default function translate(strings: TemplateStringsArray, ...values: any[]): string {
    const key = strings.join('');

    const messageValue = messages[key];
    if (messageValue) {
        return formatTranslation(messageValue, values);
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