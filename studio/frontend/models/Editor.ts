import {
    reactive,
    computed
} from 'vue';

import {
    useReactivePromise
} from '../utils/promise';

const mEditor = reactive({
    // 编辑器的标签页
    mTabs: [] as {
        filename: string;
    }[],

    // 当前活动的标签页
    mActiveTab: '',

    // 添加标签页
    fAddTab(filename: string) {
        const existingTab = this.mTabs.find(tab => tab.filename === filename);
        if (existingTab) {
            this.mActiveTab = existingTab.filename;
            return;
        }
        this.mTabs.push({
            filename: filename
        });
        this.mActiveTab = filename;
    },

    // 删除标签页
    fRemoveTab(filename: string) {
        const index = this.mTabs.findIndex(tab => tab.filename === filename);
        if (index !== -1) {
            this.mTabs.splice(index, 1);
            // 如果删除的是当前标签，切换到第一个标签
            if (this.mActiveTab === filename) {
                this.mActiveTab = this.mTabs.length > 0 ? this.mTabs[0].filename : '';
            }
        }
    },

    // 编辑窗口
    cEdit: {
        oFilterOptions: [
            { value: 'all', label: '全部' },
            { value: 'untranslated', label: '未翻译' },
            { value: 'invalid', label: '失效的键' },
            { value: 'editing', label: '正在修改' },
        ]
    }
});

export default mEditor;

import backend from '../rpc/backend';
import { mergeTextAndVariables } from '../utils/textUtils';


// 编辑器的表单数据
export function useTranslationData(filename: string) {
    return useReactivePromise(async function () {
        const translationList: {
            untranslated: string;
            translated: string;
        }[] = [];

        const summary = {
            translatedCount: 0,
            totalCount: 0,
            invalidKeysCount: 0,
            editingCount: 0
        };

        const { localAssets, keyCache } = await backend.editor.getAssetsAndCache(filename);
        summary.translatedCount = Object.keys(localAssets).length;
        summary.totalCount = keyCache.entries?.length || 0;

        for (const entry of keyCache.entries || []) {
            const sourceTexts = entry.texts;
            const sourceVariables = entry.variables || [];

            const assetsKey = entry.texts.join('');
            const targetEntry = localAssets[assetsKey];

            if (!targetEntry) {
                // 如果目标语言文件中没有该条目，使用空字符串作为译文
                translationList.push({
                    untranslated: mergeTextAndVariables(sourceTexts, sourceVariables),
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

            translationList.push({
                untranslated: mergeTextAndVariables(sourceTexts, sourceVariables),
                translated: mergeTextAndVariables(targetTexts, targetVariables)
            });
        }

        const filter = reactive({
            option: 'all',
            sourceSearch: '',
            targetSearch: '',
            result: computed(() => {
                return translationList.filter(item => {
                    const matchesSource = item.untranslated.includes(filter.sourceSearch);
                    const matchesTarget = item.translated.includes(filter.targetSearch);
                    if (filter.option === 'all') {
                        return matchesSource && matchesTarget;
                    }
                    if (filter.option === 'untranslated') {
                        return matchesSource && (!matchesTarget || item.translated === '');
                    }
                    return true;
                });
            })
        });

        return {
            translationList,
            summary,
            filter
        };
    });
}