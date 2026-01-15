export { defineConfig } from './hey-i18n/config';
import translate from './hey-i18n/translate';

export default translate;

export {
    availableLocales,
    currentLocale,
    switchLocale
} from './hey-i18n/locales';

export {
    localeNames,
    Locale,
    defineLocaleNames
} from './hey-i18n/languages';