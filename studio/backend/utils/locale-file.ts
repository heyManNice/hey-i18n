// 语言资源文件名校验。
// 使用宽松的 BCP-47 风格命名（如 zh-CN.json / zh-Hant-TW.json），
// 同时阻止路径分隔符、".." 等穿越字符进入文件路径。
const LOCALE_FILE_PATTERN = /^[A-Za-z]{2,12}(?:[_-][A-Za-z0-9]{2,8})*\.json$/;

export function assertLocaleFile(filename: string): string {
    if (typeof filename !== 'string' || !LOCALE_FILE_PATTERN.test(filename)) {
        throw new Error(`Invalid locale file name: "${filename}"`);
    }
    return filename;
}
