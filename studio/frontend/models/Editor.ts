import {
    reactive,
    computed,
    watch,
    toRaw
} from 'vue';

import {
    useReactivePromise
} from '../utils/promise';

import {
    confirm
} from '../dialogs/dialogs';

import db from '../utils/indexed-db';
import mExplorer from './Explorer';

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
    async fRemoveTab(filename: string) {
        // 检查是否有未保存的修改
        const changeData = this.mChangeData[filename] || {};
        const hasUnsavedChanges = Object.keys(changeData).length > 0;
        if (hasUnsavedChanges) {
            const userConfirmed = await confirm(`确认关闭 ${filename}？`, `有未保存的修改，如果直接关闭，你的修改将会丢失。`);
            if (!userConfirmed) {
                return;
            }
            // 确认删除
            delete this.mChangeData[filename];
        }
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
        ] as const
    },

    // 修改的新数据
    mChangeData: {} as {
        [filename: string]: {
            [key: string]: TranslationItem
        };
    }
});

// 保存标签页数据结构
type SavedTabs = {
    projectPath: string;
    mActiveTab: typeof mEditor.mActiveTab;
    mTabs: typeof mEditor.mTabs;
    date: number;
};

// 恢复保存的标签页
watch(() => mExplorer.mProjectPath, async () => {
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
});

// 保存标签页
watch(() => mEditor.mTabs, () => {
    if (!mExplorer.mProjectPath) {
        // 没有初始化完成
        return;
    }
    const dataToSave: SavedTabs = {
        projectPath: toRaw(mExplorer.mProjectPath),
        mActiveTab: toRaw(mEditor.mActiveTab),
        mTabs: toRaw(mEditor.mTabs),
        date: Date.now()
    };
    db.put('savedTabs', dataToSave);
}, { deep: true });

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
            option: 'all' as typeof mEditor.cEdit.oFilterOptions[number]['value'],
            sourceSearch: '',
            targetSearch: '',
            result: [] as typeof translationList
        });

        // 监听筛选条件和搜索框的变化，更新筛选结果
        watch(() => [
            filter.option,
            filter.sourceSearch,
            filter.targetSearch
        ], () => {
            filter.result = translationList.filter(item => {
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
                        return matchesSource && (targetItem.texts.length === 0);
                    case 'editing':
                        return matchesSource && Object.prototype.hasOwnProperty.call(changeData, item.untranslated.key);
                }

                return true;
            });
        }, { immediate: true });

        return {
            translationList,
            summary,
            filter
        };
    });
}