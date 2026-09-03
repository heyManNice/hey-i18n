import { messages, currentLocale, sourcesLocale } from './locales';
import type { MessageValue, PluralCategories } from './locales';

// 复数分发：按 pluralVarIndex 对应的数值选择 pluralCategory 中的分支。
// 顶层 texts/varIndexes 即 other 分支；没有命中类别或类别缺失时回退到顶层。
function resolveMessageValue(messageValue: MessageValue, values: any[]): MessageValue {
    if (!messageValue.isPlural || messageValue.pluralVarIndex === undefined || !messageValue.pluralCategory) {
        return messageValue;
    }

    const pluralValue = values[messageValue.pluralVarIndex];
    if (typeof pluralValue !== 'number' || Number.isNaN(pluralValue)) {
        return messageValue;
    }

    try {
        const category = new Intl.PluralRules(currentLocale).select(pluralValue) as PluralCategories | 'other';
        if (category === 'other') {
            return messageValue;
        }
        const selected = messageValue.pluralCategory[category];
        return selected || messageValue;
    } catch {
        // 当前语言不受 Intl.PluralRules 支持时按 other 处理
        return messageValue;
    }
}

function formatTranslation(messageValue: MessageValue, values: any[]): string {
    const texts = messageValue.texts;
    const varIndexes = messageValue.varIndexes;

    let result = '';
    for (let i = 0; i < texts.length; i++) {
        result += texts[i];
        if (varIndexes && i < varIndexes.length) {
            result += values[varIndexes[i]];
        }
    }
    return result;
}

/**
 * 此标记字符串为国际化字符串  
 *
 * 使用 `hey-i18n-studio` 命令启动国际化资源编辑器进行翻译资源的编辑和管理。
 *
 * @example
 * ```ts
 * import T from 'hey-i18n';
 *
 * const str = T`Hello Hey-I18n!`;
 * ```
 */
export default function translate(strings: TemplateStringsArray, ...values: any[]): string {
    const key = strings.join('');

    // 当messages[key]在最坏的情况下速度会很慢
    // 所以先判断当前语言是否为项目原文语言
    if (sourcesLocale !== currentLocale) {
        try {
            const messageValue = messages[key];
            if (messageValue) {
                return formatTranslation(resolveMessageValue(messageValue, values), values);
            }
        } catch (e) {
            console.error(
                `[hey-i18n] Failed to process translation for key [${currentLocale}] "${key}".\n - Check language pack format.\n - You should use hey-i18n-studio to edit resource files instead of manual editing.\n - If this issue persists, please report it at https://github.com/heyManNice/hey-i18n\n Error details:\n`,
                e,
            );
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
