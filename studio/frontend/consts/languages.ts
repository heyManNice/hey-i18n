// 同仓库下的 hey-i18n 包含了语言相关的信息。
import { localeNames } from "../../../src/hey-i18n/languages"

export const languages = Object.keys(localeNames) as Array<keyof typeof localeNames>;