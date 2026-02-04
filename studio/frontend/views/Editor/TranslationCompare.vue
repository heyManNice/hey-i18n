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
import { ref, h, onMounted, computed } from 'vue';
import {
    ElTableV2,
    ElSelect,
    ElOption,
    ElIcon,
    ElButton
} from 'element-plus';
import { Filter } from '@element-plus/icons-vue';
import type { Column } from 'element-plus';

import TargetHeaderCellRenderer from './TranslationCompare/TargetHeaderCellRenderer.vue';
import SourceHeaderCellRenderer from './TranslationCompare/SourceHeaderCellRenderer.vue';
import TextCellRenderer from './TranslationCompare/TextCellRenderer.vue';
import EditableCellRenderer from './TranslationCompare/EditableCellRenderer.vue';

import { useElementResize } from '../../composables/useElementResize';
import { useTranslationData } from './TranslationCompare/useTranslationData';

const props = defineProps<{
    targetLocale: string;
}>();

// --- Resize Logic ---
const tableWidth = ref(0);
const tableHeight = ref(0);

useElementResize('.app-editor-panel', (entry) => {
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    // Magic numbers from original code
    tableWidth.value = width - 56;
    tableHeight.value = height - 142;
});

// --- Data Logic ---
const {
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

const columns = computed<Column[]>(() => ([
    {
        width: tableWidth.value / 2 - 2,
        cellRenderer: ({ rowData }) => h(TextCellRenderer, {
            text: rowData.key,
            style: {
                cursor: 'not-allowed'
            }
        }),
        headerCellRenderer: () => h(SourceHeaderCellRenderer, {
            modelValue: sourceSearch.value,
            'onUpdate:modelValue': (value: string) => {
                sourceSearch.value = value;
            },
        }),
    },
    {
        width: tableWidth.value / 2,
        cellRenderer: ({ rowData }) => {
            return h(EditableCellRenderer, {
                modelValue: rowData.translated,
                sourceText: rowData.key,
                'onUpdate:modelValue': (value: string) => {
                    rowData.translated = value;
                }
            });
        },
        headerCellRenderer: () => h(TargetHeaderCellRenderer, {
            modelValue: targetSearch.value,
            'onUpdate:modelValue': (value: string) => {
                targetSearch.value = value;
            },
        }),
    },
]));
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