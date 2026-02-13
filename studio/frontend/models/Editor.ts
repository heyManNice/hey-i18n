import {
    reactive,
    computed
} from 'vue';

import {
    useReactivePromise
} from '../utils/promise';

// 翻译资源词条的项目
export type TranslationItem = {
    key: string;
    texts: string[];
    variables: string[];
}

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
    },

    // 修改的新数据
    mChangeData: {} as {
        [filename: string]: {
            [key: string]: TranslationItem
        };
    }
});

export default mEditor;

import backend from '../rpc/backend';

// 编辑器的表单数据
export function useTranslationData(filename: string) {
    return useReactivePromise(async function () {
        const translationList: {
            untranslated: TranslationItem;
            translated: TranslationItem;
        }[] = [];

        const summary = {
            translatedCount: 0,
            totalCount: 0,
            invalidKeysCount: 0,
            editingCount: computed(() => {
                const changeData = mEditor.mChangeData[filename] || {};
                return Object.keys(changeData).length;
            })
        };

        const { localAssets, keyCache } = await backend.editor.getAssetsAndCache(filename);
        summary.translatedCount = Object.keys(localAssets).length;
        summary.totalCount = keyCache.entries?.length || 0;

        for (const entry of keyCache.entries || []) {
            const sourceTexts = entry.texts;
            const sourceVariables = entry.variables || [];

            const key = entry.texts.join('');
            const targetEntry = localAssets[key];

            if (!targetEntry) {
                // 如果目标语言文件中没有该条目，使用空字符串作为译文
                translationList.push({
                    untranslated: {
                        key,
                        texts: sourceTexts,
                        variables: sourceVariables
                    },
                    translated: {
                        key,
                        texts: [],
                        variables: []
                    },
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
                untranslated: {
                    key,
                    texts: sourceTexts,
                    variables: sourceVariables
                },
                translated: {
                    key,
                    texts: targetTexts,
                    variables: targetVariables
                }
            });
        }

        const filter = reactive({
            option: 'all',
            sourceSearch: '',
            targetSearch: '',
            result: computed(() => {
                return translationList.filter(item => {
                    const matchesSource = item.untranslated.texts.join('').includes(filter.sourceSearch);
                    const matchesTarget = item.translated.texts.join('').includes(filter.targetSearch);
                    if (filter.option === 'all') {
                        return matchesSource && matchesTarget;
                    }
                    if (filter.option === 'untranslated') {
                        return matchesSource && (!matchesTarget || item.translated.texts.length === 0);
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