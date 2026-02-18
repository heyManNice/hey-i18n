import assets from '../services/assets';
import scaner from '../services/scaner';

export function getAssetsAndCache(targetLocale: string) {
    return {
        localAssets: assets.getI18nFile(targetLocale),
        keyCache: scaner.getI18nStringsFromCacheFile(),
    }
}

// 储存翻译结果
export function saveTranslation(filename: string, content: Parameters<typeof assets.saveI18nFile>[1]) {
    assets.saveI18nFile(filename, content);
}