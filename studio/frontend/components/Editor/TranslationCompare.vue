<template>
    <div class="translation-compare-container">
        <div class="summary-bar">
            <span>已翻译: {{ translatedCount }}</span>
            <span>总计: {{ totalCount }}</span>
            <span>失效的键: {{ invalidKeysCount }}</span>
        </div>
        <div class="editor-area">
            <el-table-v2 :columns="columns" :data="data" :width="1000" :height="200" fixed />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import {
    ElTableV2,
    ElInput,
} from 'element-plus';
import type { Column } from 'element-plus';

const translatedCount = ref(3);
const totalCount = ref(3);
const invalidKeysCount = ref(0);

const data = ref([
    {
        key: '你的名字是{name}, 今年{age}岁了。',
        translated: 'Your name is {name}, and you are {age} years old.',
    },
    {
        key: '测试数据',
        translated: 'Test Data',
    },
    {
        key: '总消费是{amount}元',
        translated: 'The total expenditure is {amount} CNY.',
    }
]);

const columns: Column[] = [
    {
        key: 'zhCN',
        title: 'zh-CN',
        dataKey: 'zhCN',
        width: 500,
        cellRenderer: ({ rowData }) => h(ElInput, {
            modelValue: rowData.key,
            disabled: true,
        }),
    },
    {
        key: 'enUS',
        title: 'en-US',
        dataKey: 'enUS',
        width: 500,
        cellRenderer: ({ rowData, rowIndex }) => h(ElInput, {
            modelValue: rowData.translated,
            'onUpdate:modelValue': (value) => {
                data.value[rowIndex].translated = value;
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