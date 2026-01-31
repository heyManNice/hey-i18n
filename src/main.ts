import translate from './hey-i18n/translate';

export default translate;

export {
    availableLocales,
    currentLocale,
    switchLocale,
    isRtlLocale
} from './hey-i18n/locales';

export {
    localeNames,
    Locale,
    defineLocaleNames
} from './hey-i18n/languages';