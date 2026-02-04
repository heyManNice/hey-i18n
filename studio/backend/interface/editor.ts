import assets from '../services/assets';
import scaner from '../services/scaner';

export function getAssetsAndCache(targetLocale: string) {
    return {
        localAssets: assets.getI18nFile(targetLocale),
        keyCache: scaner.getI18nStringsFromCacheFile(),
    }
}