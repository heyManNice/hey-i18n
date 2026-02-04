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
            <el-table-v2 :columns="columns" :data="filteredData" :width="tableWidth" :height="tableHeight" fixed />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, computed, nextTick } from 'vue';
import {
    ElTableV2,
    ElInput,
    ElSelect,
    ElOption,
    ElIcon,
    ElButton
} from 'element-plus';
import { Filter } from '@element-plus/icons-vue';
import type { Column } from 'element-plus';

import TargetHeaderCellRenderer from './TranslationCompare/TargetHeaderCellRenderer.vue';
import SourceHeaderCellRenderer from './TranslationCompare/SourceHeaderCellRenderer.vue';

import { useElementResize } from '../../composables/useElementResize';
import { useTranslationData } from './TranslationCompare/useTranslationData';
import { splitTextWithPlaceholders } from '../../utils/textUtils';

const props = defineProps<{
    targetLocale: string;
}>();

// --- Resize Logic ---
const tableWidth = ref(1000);
const tableHeight = ref(400);

useElementResize('.app-editor-panel', (entry) => {
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    // Magic numbers from original code
    tableWidth.value = width - 56;
    tableHeight.value = height - 142;
});

// --- Data Logic ---
const {
    originalData,
    filteredData,
    loadData,
    translatedCount,
    totalCount,
    invalidKeysCount,
    editingCount,
    filterOption,
    sourceSearch,
    targetSearch
} = useTranslationData(props.targetLocale);

onMounted(() => {
    loadData();
});

const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'untranslated', label: '未翻译' },
    { value: 'invalid', label: '失效的键' },
    { value: 'editing', label: '正在修改' },
];

// --- Table Logic ---
const editingRowIndex = ref<number | null>(null);

const renderCell = (text: string) => {
    const parts = splitTextWithPlaceholders(text);
    return h('div', { class: 'custom-cell-renderer' }, parts.map(part => {
        if (part.type === 'placeholder') {
            return h('span', { class: 'placeholder' }, part.content);
        }
        return h('span', part.content);
    }));
};

const columns = computed<Column[]>(() => ([
    {
        width: tableWidth.value / 2 - 2,
        cellRenderer: ({ rowData }) => renderCell(rowData.key),
        headerCellRenderer: () => h(SourceHeaderCellRenderer, {
            modelValue: sourceSearch.value,
            'onUpdate:modelValue': (value: string) => {
                sourceSearch.value = value;
            },
        }),
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
        headerCellRenderer: () => h(TargetHeaderCellRenderer, {
            modelValue: targetSearch.value,
            'onUpdate:modelValue': (value: string) => {
                targetSearch.value = value;
            },
        }),
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