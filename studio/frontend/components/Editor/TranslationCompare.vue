<template>
    <div class="translation-compare-container">
        <div class="summary-bar">
            <span>已翻译: {{ translatedCount }}</span>
            <span>总计: {{ totalCount }}</span>
            <span>失效的键: {{ invalidKeysCount }}</span>
        </div>
        <div class="editor-area">
            <el-table-v2 :columns="columns" :data="data" :width="1000" :height="250" fixed />
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

const renderCell = (text: string) => {
    const parts = text.split(/({[^}]+})/g).filter(p => p);
    return h('div', { class: 'custom-cell-renderer' }, parts.map(part => {
        if (part.startsWith('{') && part.endsWith('}')) {
            return h('span', { class: 'placeholder' }, part);
        }
        return h('span', part);
    }));
};

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
        translated: 'The total expenditure is {amount} CNY',
    },
    {
        key: '今天是{YYYY}年{MM}月{DD}日',
        translated: 'Today is {DD}/{MM}/{YYYY}',
    }
]);

const editingRowIndex = ref<number | null>(null);

const columns: Column[] = [
    {
        key: 'zhCN',
        title: '项目原文 (zh-CN)',
        dataKey: 'zhCN',
        width: 500,
        cellRenderer: ({ rowData }) => renderCell(rowData.key),
    },
    {
        key: 'enUS',
        title: '目标 (en-US)',
        dataKey: 'enUS',
        width: 500,
        cellRenderer: ({ rowData, rowIndex }) => {
            if (editingRowIndex.value === rowIndex) {
                // 模式二：可编辑的输入框
                return h(ElInput, {
                    modelValue: rowData.translated,
                    'onUpdate:modelValue': (value) => {
                        data.value[rowIndex].translated = value;
                    },
                    // 当输入框失去焦点时，退出编辑模式
                    onBlur: () => {
                        editingRowIndex.value = null;
                    },
                    // 自动聚焦
                    onVnodeMounted: (vnode) => {
                        vnode.el?.querySelector('input')?.focus();
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
                return readOnlyNode;
            }
        },
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


:deep(.custom-cell-renderer) {
    padding: 0 11px;
    line-height: 32px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    width: 500px;
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
</style>