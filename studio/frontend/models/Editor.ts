import { reactive, computed, watch, toRaw } from 'vue';

import { useReactivePromise } from '../utils/promise';

import { confirm } from '../dialogs/dialogs';

import db from '../utils/indexed-db';
import mExplorer from './Explorer';

// 复数类别（与运行时的 other-基底模型一致，other 在 texts/varIndexes 上）
export type PluralCategoryKey = 'zero' | 'one' | 'two' | 'few' | 'many';
export type PluralBranch = {
    texts: string[];
    varIndexes?: number[];
};
export type PluralCategoryData = Partial<Record<PluralCategoryKey, PluralBranch>>;

// 翻译资源词条的项目
export type TranslationItem = {
    key: string;
    texts: string[];
    variables: string[];
    varIndexes?: number[];
    isPlural?: boolean;
    pluralVarIndex?: number;
    pluralCategory?: PluralCategoryData;
};

// 表格中的一行；isInvalid 表示该键已不存在于源码扫描缓存中
export type TranslationRow = {
    untranslated: TranslationItem;
    translated: TranslationItem;
    isInvalid?: boolean;
};

const mEditor = reactive({
    // 编辑器的标签页
    mTabs: [] as {
        filename: string;
    }[],

    // 当前活动的标签页
    mActiveTab: '',

    // 添加标签页
    fAddTab(filename: string) {
        const existingTab = this.mTabs.find((tab) => tab.filename === filename);
        if (existingTab) {
            this.mActiveTab = existingTab.filename;
            return;
        }
        this.mTabs.push({
            filename: filename,
        });
        this.mActiveTab = filename;
    },

    // 删除标签页
    async fRemoveTab(filename: string) {
        // 检查是否有未保存的修改
        const changeData = this.mChangeData[filename] || {};
        const hasUnsavedChanges = Object.keys(changeData).length > 0;
        if (hasUnsavedChanges) {
            const userConfirmed = await confirm(
                `确认关闭 ${filename}？`,
                `有未保存的修改，如果直接关闭，你的修改将会丢失。`,
            );
            if (!userConfirmed) {
                return;
            }
            // 确认删除
            delete this.mChangeData[filename];
        }
        const index = this.mTabs.findIndex((tab) => tab.filename === filename);
        if (index !== -1) {
            this.mTabs.splice(index, 1);
            // 如果删除的是当前标签，切换到第一个标签
            if (this.mActiveTab === filename) {
                this.mActiveTab = this.mTabs.length > 0 ? this.mTabs[0].filename : '';
            }
        }
    },

    // 保存文件函数
    fSaveFile(filename: string) {
        const content = this.mChangeData[filename];
        if (!content) {
            return;
        }
        const newContent: Parameters<typeof backend.editor.saveTranslation>[1] = {};
        for (const key in content) {
            const item = content[key];
            newContent[key] = {
                texts: item.texts,
                varIndexes: item.varIndexes ?? [],
                ...(item.isPlural === undefined ? {} : { isPlural: item.isPlural }),
                ...(item.pluralVarIndex === undefined ? {} : { pluralVarIndex: item.pluralVarIndex }),
                ...(item.pluralCategory
                    ? {
                          pluralCategory: Object.fromEntries(
                              Object.entries(item.pluralCategory).map(([category, branch]) => [
                                  category,
                                  {
                                      texts: branch?.texts ?? [],
                                      varIndexes: branch?.varIndexes ?? [],
                                  },
                              ]),
                          ),
                      }
                    : {}),
            };
        }
        return backend.editor.saveTranslation(filename, newContent);
    },

    // 删除文件函数
    fDeleteFile(filename: string) {
        if (this.mChangeData[filename]) {
            delete this.mChangeData[filename];
        }
        return backend.editor.deleteTranslationFile(filename);
    },

    // AI 批量翻译当前文件未翻译的条目，生成可审阅的修改草稿
    async fAiTranslate(filename: string) {
        const result = await backend.ai.translateFile(filename);
        if (result.translated.length === 0) {
            return result;
        }
        if (!this.mChangeData[filename]) {
            this.mChangeData[filename] = {};
        }
        for (const item of result.translated) {
            this.mChangeData[filename][item.key] = {
                key: item.key,
                texts: item.texts,
                variables: item.variables,
                varIndexes: item.varIndexes,
            };
        }
        return result;
    },

    // 编辑窗口
    cEdit: {
        oFilterOptions: [
            { value: 'all', label: '全部' },
            { value: 'untranslated', label: '未翻译' },
            { value: 'invalid', label: '失效的键' },
            { value: 'editing', label: '正在修改' },
        ] as const,
    },

    // 修改的新数据
    mChangeData: {} as {
        [filename: string]: {
            [key: string]: TranslationItem;
        };
    },
});

// 保存标签页数据结构
type SavedTabs = {
    projectPath: string;
    mActiveTab: typeof mEditor.mActiveTab;
    mTabs: typeof mEditor.mTabs;
    date: number;
};

// 恢复保存的标签页
watch(
    () => mExplorer.mProjectPath,
    async () => {
        if (mExplorer.mProjectPath === '') {
            // 没有初始化完成
            return;
        }
        const savedTabs = await db.get('savedTabs', mExplorer.mProjectPath);
        if (!savedTabs) {
            // 没有保存的数据
            return;
        }
        mEditor.mActiveTab = savedTabs.mActiveTab;
        mEditor.mTabs = savedTabs.mTabs;
    },
);

// 保存标签页
watch(
    () => mEditor.mTabs,
    () => {
        if (!mExplorer.mProjectPath) {
            // 没有初始化完成
            return;
        }
        const dataToSave: SavedTabs = {
            projectPath: toRaw(mExplorer.mProjectPath),
            mActiveTab: toRaw(mEditor.mActiveTab),
            mTabs: toRaw(mEditor.mTabs),
            date: Date.now(),
        };
        db.put('savedTabs', dataToSave);
    },
    { deep: true },
);

// 关闭窗口时候，如果有未保存的修改，提示用户确认
window.addEventListener('beforeunload', (event) => {
    if (Object.keys(mEditor.mChangeData).length > 0) {
        event.preventDefault();
        event.returnValue = '';
    }
});

export default mEditor;

import backend from '../rpc/backend';

// 编辑器的表单数据
export function useTranslationData(filename: string) {
    return useReactivePromise(async function () {
        const translationList: TranslationRow[] = [];

        const summary = {
            translatedCount: 0,
            totalCount: 0,
            invalidKeysCount: 0,
            editingCount: computed(() => {
                const changeData = mEditor.mChangeData[filename] || {};
                return Object.keys(changeData).length;
            }),
        };

        const { localAssets, keyCache } = await backend.editor.getAssetsAndCache(filename);
        const cacheKeys = new Set((keyCache.entries || []).map((entry) => entry.texts.join('')));
        const localKeys = Object.keys(localAssets);
        summary.totalCount = cacheKeys.size;
        summary.translatedCount = localKeys.filter((key) => cacheKeys.has(key)).length;
        summary.invalidKeysCount = localKeys.length - summary.translatedCount;

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
                        variables: sourceVariables,
                    },
                    translated: {
                        key,
                        texts: [],
                        variables: [],
                    },
                });
                continue;
            }

            const targetTexts = targetEntry.texts || [];
            const targetVariables =
                Array.from(
                    {
                        length: targetEntry.varIndexes?.length || 0,
                    },
                    (_, i) => {
                        const currutVarIndex = targetEntry.varIndexes?.[i];
                        const variableName = sourceVariables[currutVarIndex || 0];
                        return variableName;
                    },
                ) || [];

            translationList.push({
                untranslated: {
                    key,
                    texts: sourceTexts,
                    variables: sourceVariables,
                },
                translated: {
                    key,
                    texts: targetTexts,
                    variables: targetVariables,
                    isPlural: targetEntry.isPlural,
                    pluralVarIndex: targetEntry.pluralVarIndex,
                    pluralCategory: targetEntry.pluralCategory,
                },
            });
        }

        // 失效键：存在于语言包但已不在源码缓存中的键。
        // 原文信息无从得知，只保留 key 与译文，供查看/一键清理。
        const invalidTranslationList: TranslationRow[] = localKeys
            .filter((key) => !cacheKeys.has(key))
            .map((key) => {
                const asset = localAssets[key];
                return {
                    untranslated: {
                        key,
                        texts: [`(已失效) ${key}`],
                        variables: [],
                    },
                    translated: {
                        key,
                        texts: asset.texts || [],
                        variables: (asset.varIndexes || []).map((varIndex) => `var${varIndex}`),
                        varIndexes: asset.varIndexes || [],
                    },
                    isInvalid: true,
                };
            });

        const filter = reactive({
            option: 'all' as (typeof mEditor.cEdit.oFilterOptions)[number]['value'],
            sourceSearch: '',
            targetSearch: '',
            result: [] as typeof translationList,
        });

        // 监听筛选条件和搜索框的变化，更新筛选结果
        watch(
            () => [filter.option, filter.sourceSearch, filter.targetSearch],
            () => {
                const sourceList = filter.option === 'invalid' ? invalidTranslationList : translationList;
                filter.result = sourceList.filter((item) => {
                    // 原匹配
                    const matchesSource = item.untranslated.texts.join('').includes(filter.sourceSearch);

                    // 看看内存中有没有目标修改数据
                    const changeData = mEditor.mChangeData[filename] || {};
                    const targetItem = changeData[item.untranslated.key] || item.translated;

                    // 目标匹配
                    const matchesTarget = targetItem.texts.join('').includes(filter.targetSearch);
                    switch (filter.option) {
                        case 'all':
                            return matchesSource && matchesTarget;
                        case 'untranslated':
                            return matchesSource && targetItem.texts.length === 0;
                        case 'invalid':
                            return matchesSource && matchesTarget;
                        case 'editing':
                            return (
                                matchesSource && Object.prototype.hasOwnProperty.call(changeData, item.untranslated.key)
                            );
                    }

                    return matchesSource && matchesTarget;
                });
            },
            { immediate: true },
        );

        return {
            translationList,
            summary,
            filter,
        };
    });
}
