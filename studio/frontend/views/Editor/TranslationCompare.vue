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
        <div class="editor-area">
            <div style="position: absolute; width: 100%;">
                <el-table :data="filteredData">
                    <el-table-column min-width="45">
                        <template #header>
                            <SourceHeaderCellRenderer :model-value="sourceSearch"
                                @update:modelValue="value => { sourceSearch = value; }" />
                        </template>
                        <template #default="scope">
                            <TextCellRenderer :text="scope.row.untranslated" style="cursor: not-allowed;" />
                        </template>
                    </el-table-column>
                    <el-table-column min-width="55">
                        <template #header>
                            <TargetHeaderCellRenderer :model-value="targetSearch"
                                @update:modelValue="value => { targetSearch = value; }" />
                        </template>
                        <template #default="scope">
                            <EditableCellRenderer :model-value="scope.row.translated"
                                :source-text="scope.row.untranslated"
                                @update:modelValue="value => { scope.row.translated = value; }" />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    onMounted
} from 'vue';
import {
    ElTable,
    ElTableColumn,
    ElSelect,
    ElOption,
    ElIcon,
    ElButton
} from 'element-plus';
import { Filter } from '@element-plus/icons-vue';

import TargetHeaderCellRenderer from './TranslationCompare/TargetHeaderCellRenderer.vue';
import SourceHeaderCellRenderer from './TranslationCompare/SourceHeaderCellRenderer.vue';
import TextCellRenderer from './TranslationCompare/TextCellRenderer.vue';
import EditableCellRenderer from './TranslationCompare/EditableCellRenderer.vue';

import { useTranslationData } from './TranslationCompare/useTranslationData';
import mEditor from '../../models/Editor';

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
} = useTranslationData(mEditor.mActiveTab);

onMounted(() => {
    loadData();
});

const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'untranslated', label: '未翻译' },
    { value: 'invalid', label: '失效的键' },
    { value: 'editing', label: '正在修改' },
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
    position: relative;
}

.summary-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 5px 10px;
    border-bottom: 1px solid var(--border-color);
    font-size: 14px;
    min-width: 550px;
}

.filter {
    margin-left: auto;
}

:deep(.el-table) {
    border: 1px solid var(--border-color);
    border-radius: 5px;
}

:deep(.el-table__header .el-table__cell),
:deep(.el-table__row .el-table__cell) {
    background-color: var(--panel-bg-color) !important;
    color: var(--text-color) !important;
}

:deep(.el-table__header-wrapper) {
    border-bottom: 1px solid var(--border-color);
}

:deep(.el-table__body) {
    background-color: var(--panel-bg-color);
}
</style>