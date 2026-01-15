import {
    messages,
    currentLocale,
    sourcesLocale
} from './locales';
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

    // 当messages[key]在最坏的情况下速度会很慢
    // 所以先判断当前语言是否为项目原文语言
    if (sourcesLocale !== currentLocale) {
        try {
            const messageValue = messages[key];
            if (messageValue) {
                return formatTranslation(messageValue, values);
            }
        } catch (e) {
            console.error(`[hey-i18n] Failed to process translation for key [${currentLocale}] "${key}".\n - Check language pack format.\n - You should use hey-i18n-studio to edit resource files instead of manual editing.\n - If this issue persists, please report it at https://github.com/heyManNice/hey-i18n\n Error details:\n`, e);
        }
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