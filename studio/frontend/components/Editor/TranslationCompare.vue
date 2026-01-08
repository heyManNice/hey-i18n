<template>
    <div class="translation-compare-container">
        <div class="summary-bar">
            <span>已翻译: {{ translatedCount }}</span>
            <span>总计: {{ totalCount }}</span>
            <span>失效的键: {{ invalidKeysCount }}</span>
        </div>
        <div class="editor-area">
            <el-table-v2 :columns="columns" :data="data" :width="800" :height="600" fixed />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import {
    ElTableV2,
    ElInput,
    ElAutoResizer
} from 'element-plus';
import type { Column } from 'element-plus';

const translatedCount = ref(98);
const totalCount = ref(100);
const invalidKeysCount = ref(2);

const generateData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        key: `key_${i}`,
        zhCN: `你好世界_${i}`,
        enUS: `Hello World_${i}`,
    }));
};

const data = ref(generateData(100));

const columns: Column[] = [
    {
        key: 'zhCN',
        title: 'zh-CN',
        dataKey: 'zhCN',
        width: 400,
        cellRenderer: ({ rowData }) => h(ElInput, {
            modelValue: rowData.zhCN,
            disabled: true,
        }),
    },
    {
        key: 'enUS',
        title: 'en-US',
        dataKey: 'enUS',
        width: 400,
        cellRenderer: ({ rowData, rowIndex }) => h(ElInput, {
            modelValue: rowData.enUS,
            'onUpdate:modelValue': (value) => {
                data.value[rowIndex].enUS = value;
            },
        }),
    },
];
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

:deep(.el-input.is-disabled .el-input__wrapper) {
    background-color: var(--input-disabled-bg-color) !important;
}
</style>