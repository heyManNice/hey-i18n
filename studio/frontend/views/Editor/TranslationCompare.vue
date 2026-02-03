<template>
    <div class="translation-compare-container">
        <div class="summary-bar">
            <span>已翻译: {{ translatedCount }}</span>
            <span>总计: {{ totalCount }}</span>
            <span>失效的键: {{ invalidKeysCount }}</span>
            <span>正在修改：{{ editingCount }}</span>
            <div class="filter">
                <el-select v-model="filterOption" placeholder="筛选" style="width: 130px;">
                    <template #prefix>
                        <el-icon>
                            <Filter />
                        </el-icon>
                    </template>
                    <el-option v-for="item in filterOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </div>
            <el-button type="primary" plain>提交</el-button>
        </div>
        <div class="editor-area" :style="{
            '--col-width': tableWidth / 2 + 'px'
        }">
            <el-table-v2 :columns="columns" :data="data" :width="tableWidth" :height="tableHeight" fixed />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onUnmounted, computed, nextTick } from 'vue';
import {
    ElTableV2,
    ElInput,
    ElSelect,
    ElOption,
    ElIcon,
    ElButton
} from 'element-plus';

import backend from '../../rpc/backend';

import {
    Filter,
    Search,
} from '@element-plus/icons-vue';

import type { Column } from 'element-plus';

const props = defineProps<{
    targetLocale: string;
}>();

const tableWidth = ref(1000);
const tableHeight = ref(400);

const resizeObserver = new ResizeObserver(entries => {
    const entry = entries[0];
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;

    // 表格大小的魔法数字
    tableWidth.value = width - 56;
    tableHeight.value = height - 142;
});

onMounted(async () => {
    const localAssets = await backend.assets.getI18nFile(props.targetLocale);
    translatedCount.value = Object.keys(localAssets).length;
    const keyCache = await backend.scaner.getI18nStringsFromCacheFile();
    totalCount.value = keyCache.entries?.length || 0;

    // 表格数据
    const originalDataList: typeof originalData.value = [];

    function merge(sourceTexts: string[], TargetTexts: string[]) {
        let result = '';
        for (let i = 0; i < sourceTexts.length; i++) {
            result += sourceTexts[i];
            if (i < TargetTexts.length) {
                result += `{${TargetTexts[i]}}`;
            }
        }
        return result;
    }

    // 遍历缓存的键列表，构建表格数据
    for (const entry of keyCache.entries || []) {
        const sourceTexts = entry.texts;
        const sourceVariables = entry.variables || [];

        const assetsKey = entry.texts.join('');
        const targetEntry = localAssets[assetsKey];
        if (!targetEntry) {
            // 如果目标语言文件中没有该条目，使用空字符串作为译文
            originalDataList.push({
                key: merge(sourceTexts, sourceVariables),
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
            key: merge(sourceTexts, sourceVariables),
            translated: merge(targetTexts, targetVariables),
        });
    }
    originalData.value = originalDataList;
});

onMounted(() => {
    const containerRef = document.querySelector('.app-editor-panel')
    if (containerRef) {
        resizeObserver.observe(containerRef);
    }
});
onUnmounted(() => {
    resizeObserver.disconnect();
});

const filterOption = ref('all');
const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'untranslated', label: '未翻译' },
    { value: 'invalid', label: '失效的键' },
    { value: 'editing', label: '正在修改' },
];

const sourceSearch = ref('');
const targetSearch = ref('');

const translatedCount = ref(0);
const totalCount = ref(0);
const invalidKeysCount = ref(0);
const editingCount = ref(0);

const originalData = ref<{
    key: string
    translated: string
}[]>([

]);

const data = computed(() => {
    return originalData.value.filter(item => {
        const sourceMatch = item.key.toLowerCase().includes(sourceSearch.value.toLowerCase());
        const targetMatch = item.translated.toLowerCase().includes(targetSearch.value.toLowerCase());
        return sourceMatch && targetMatch;
    });
});

const editingRowIndex = ref<number | null>(null);

const renderCell = (text: string) => {
    const parts = text.split(/({[^}]+})/g).filter(p => p);
    return h('div', { class: 'custom-cell-renderer' }, parts.map(part => {
        if (part.startsWith('{') && part.endsWith('}')) {
            return h('span', { class: 'placeholder' }, part);
        }
        return h('span', part);
    }));
};


const columns = computed<Column[]>(() => ([
    {
        width: tableWidth.value / 2 - 2,
        cellRenderer: ({ rowData }) => renderCell(rowData.key),
        headerCellRenderer: () => h('div', { class: 'custom-header' }, [
            h('span', '项目原文 (zh-CN)'),
            h(ElInput, {
                modelValue: sourceSearch.value,
                'onUpdate:modelValue': (val) => sourceSearch.value = val,
                placeholder: '搜索原文',
                class: 'header-search-input',
                prefixIcon: Search,
                clearable: true,
                size: 'small',
            })
        ]),
    },
    {
        width: tableWidth.value / 2,
        cellRenderer: ({ rowData, rowIndex }) => {
            if (editingRowIndex.value === rowIndex) {
                // 模式二：可编辑的输入框
                return h(ElInput, {
                    modelValue: rowData.translated,
                    'onUpdate:modelValue': (value) => {
                        const originalIndex = originalData.value.findIndex(item => item.key === rowData.key);
                        if (originalIndex !== -1) {
                            originalData.value[originalIndex].translated = value;
                        }
                    },
                    // 当输入框失去焦点时，退出编辑模式
                    onBlur: () => {
                        editingRowIndex.value = null;
                    },
                    // 自动聚焦
                    onVnodeMounted: (vnode) => {
                        nextTick(() => {
                            vnode.component?.exposed?.focus();
                        });
                    },
                });
            } else {
                // 模式一：只读的高亮视图
                const readOnlyNode = renderCell(rowData.translated);
                // 添加点击事件，进入编辑模式
                readOnlyNode.props = readOnlyNode.props || {};
                readOnlyNode.props.onClick = () => {
                    editingRowIndex.value = rowIndex;
                };
                readOnlyNode.props.style = { cursor: 'pointer' };
                return readOnlyNode;
            }
        },
        headerCellRenderer: () => h('div', { class: 'custom-header' }, [
            h('span', `目标 (en-US)`),
            h(ElInput, {
                modelValue: targetSearch.value,
                'onUpdate:modelValue': (val) => targetSearch.value = val,
                placeholder: '搜索译文',
                class: 'header-search-input',
                prefixIcon: Search,
                clearable: true,
                size: 'small',
            })
        ]),
    },
]))
</script>

<style scoped>
.translation-compare-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 10px;
    padding: 10px;
    background-color: var(--panel-bg-color);
    color: var(--text-color);
}

.summary-bar {
    display: flex;
    gap: 20px;
    padding: 5px 10px;
    border-bottom: 1px solid var(--border-color);
    font-size: 14px;
}

.editor-area {
    flex-grow: 1;
}

/* 确保 el-table-v2 样式正确 */
:deep(.el-table-v2) {
    border: 1px solid var(--border-color);
    border-radius: 5px;
}

:deep(.el-table-v2__header-cell),
:deep(.el-table-v2__row-cell) {
    background-color: var(--panel-bg-color) !important;
    color: var(--text-color) !important;
}

:deep(.el-table-v2__header-row) {
    border-bottom: 1px solid var(--border-color);
}

:deep(.el-table-v2__table.el-table-v2__main) {
    background-color: var(--panel-bg-color);
}

:deep(.el-input.is-disabled .el-input__wrapper) {
    background-color: var(--input-disabled-bg-color) !important;
}


:deep(.custom-cell-renderer) {
    padding: 0 11px;
    height: 32px;
    line-height: 32px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: not-allowed;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    width: calc(var(--col-width) - 10px);
}

:deep(.placeholder) {
    background-color: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    border-radius: 4px;
    padding: 2px 5px;
    margin: 0 2px;
    font-weight: bold;
}

:deep(.el-input__inner) {
    font-size: 15px;
}

:deep(.custom-header) {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 0 10px;
}

:deep(.custom-header > span) {
    white-space: nowrap;
}

.summary-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 5px 10px;
    border-bottom: 1px solid var(--border-color);
    font-size: 14px;
}

.filter {
    margin-left: auto;
}
</style>