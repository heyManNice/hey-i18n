import { locale } from './locales';

export default function translate(strings: TemplateStringsArray): string {
    const key = strings[0] as string;
    return locale[key] ?? key;
}