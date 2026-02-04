import { ref, computed, type Ref } from 'vue';
import backend from '../../../rpc/backend';
import { mergeTextAndVariables } from '../../../utils/textUtils';

export interface TranslationItem {
    key: string;
    translated: string;
}

export interface FilterOptions {
    filterOption: Ref<string>;
    sourceSearch: Ref<string>;
    targetSearch: Ref<string>;
}

export function useTranslationData(targetLocale: string) {
    const originalData = ref<TranslationItem[]>([]);

    const translatedCount = ref(0);
    const totalCount = ref(0);
    const invalidKeysCount = ref(0);
    const editingCount = ref(0);

    const filterOption = ref('all');
    const sourceSearch = ref('');
    const targetSearch = ref('');

    const loadData = async () => {
        const { localAssets, keyCache } = await backend.editor.getAssetsAndCache(targetLocale);

        const keys = Object.keys(localAssets);
        translatedCount.value = keys.length;
        totalCount.value = keyCache.entries?.length || 0;

        const originalDataList: TranslationItem[] = [];

        // 遍历缓存的键列表，构建表格数据
        for (const entry of keyCache.entries || []) {
            const sourceTexts = entry.texts;
            const sourceVariables = entry.variables || [];

            const assetsKey = entry.texts.join('');
            const targetEntry = localAssets[assetsKey];

            if (!targetEntry) {
                // 如果目标语言文件中没有该条目，使用空字符串作为译文
                originalDataList.push({
                    key: mergeTextAndVariables(sourceTexts, sourceVariables),
                    translated: '',
                });
                continue;
            }

            const targetTexts = targetEntry.t || [];
            const targetVariables = Array.from({
                length: targetEntry.v?.length || 0
            }, (_, i) => {
                const currutVarIndex = targetEntry.v?.[i];
                const variableName = sourceVariables[currutVarIndex || 0];
                return variableName;
            }) || [];

            originalDataList.push({
                key: mergeTextAndVariables(sourceTexts, sourceVariables),
                translated: mergeTextAndVariables(targetTexts, targetVariables),
            });
        }
        originalData.value = originalDataList;
    };

    const filteredData = computed(() => {
        return originalData.value.filter(item => {
            // Apply text search
            const sourceMatch = item.key.toLowerCase().includes(sourceSearch.value.toLowerCase());
            const targetMatch = item.translated.toLowerCase().includes(targetSearch.value.toLowerCase());

            if (!sourceMatch || !targetMatch) return false;

            // Apply category filter
            switch (filterOption.value) {
                case 'untranslated':
                    return !item.translated;
                case 'editing':
                    // TODO: implement logic if needed, previously logic was missing/placeholder based on context
                    // Original code didn't actually implement filtering for 'editing' or 'invalid' properly in the computed property 
                    // other than having options. The original code only filtered by search text.
                    // But the loop builds 'key' and 'translated'.
                    return true;
                case 'invalid':
                    // Placeholder for invalid keys logic
                    return true;
                default:
                    return true;
            }
        });
    });

    return {
        originalData,
        filteredData,
        loadData,
        // Stats
        translatedCount,
        totalCount,
        invalidKeysCount,
        editingCount,
        // Filters
        filterOption,
        sourceSearch,
        targetSearch
    };
}
