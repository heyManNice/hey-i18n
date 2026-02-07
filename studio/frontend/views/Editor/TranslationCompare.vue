<template>
    <div class="container">
        <div class="summary">
            <span>已翻译: {{ result.data?.summary.translatedCount ?? '-' }}</span>
            <span>总计: {{ result.data?.summary.totalCount ?? '-' }}</span>
            <span>失效的键: {{ result.data?.summary.invalidKeysCount ?? '-' }}</span>
            <span>正在修改：{{ result.data?.summary.editingCount ?? '-' }}</span>
            <div class="filter">
                <el-select :model-value="result.data?.filter.option" @update:model-value="val => {
                    if (result.data) { result.data.filter.option = val }
                }" placeholder="筛选" style="width: 130px;">
                    <template #prefix>
                        <el-icon>
                            <Filter />
                        </el-icon>
                    </template>
                    <el-option v-for="item in mEditor.cEdit.oFilterOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </div>
            <el-button type="primary" plain>提交</el-button>
        </div>
        <div class="editor-area">
            <div style="position: absolute; width: 100%;">
                <el-table v-loading="result.isLoading" v-if="!result.error" :data="result.data?.filter.result">
                    <el-table-column min-width="45">
                        <template #header>
                            <SourceHeaderCellRenderer :model-value="result.data?.filter.sourceSearch"
                                @update:modelValue="val => { if (result.data) { result.data.filter.sourceSearch = val } }" />
                        </template>
                        <template #default="scope">
                            <TextCellRenderer :text="scope.row.untranslated" style="cursor: not-allowed;" />
                        </template>
                    </el-table-column>
                    <el-table-column min-width="55">
                        <template #header>
                            <TargetHeaderCellRenderer :model-value="result.data?.filter.targetSearch"
                                @update:modelValue="val => { if (result.data) { result.data.filter.targetSearch = val } }" />
                        </template>
                        <template #default="scope">
                            <EditableCellRenderer v-model="scope.row.translated"
                                :source-text="scope.row.untranslated" />
                        </template>
                    </el-table-column>
                </el-table>
                <p v-if="result.error">{{ result.error }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ElTable,
    ElTableColumn,
    ElSelect,
    ElOption,
    ElIcon,
    ElButton
} from 'element-plus';

import {
    Filter
} from '@element-plus/icons-vue';

import TargetHeaderCellRenderer from './TranslationCompare/TargetHeaderCellRenderer.vue';
import SourceHeaderCellRenderer from './TranslationCompare/SourceHeaderCellRenderer.vue';
import TextCellRenderer from './TranslationCompare/TextCellRenderer.vue';
import EditableCellRenderer from './TranslationCompare/EditableCellRenderer.vue';

import mEditor from '../../models/Editor';

import { useTranslationData } from '../../models/Editor';
const result = useTranslationData(mEditor.mActiveTab);
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 10px;
    padding: 10px;
    background-color: var(--panel-bg-color);
    color: var(--text-color);
}

.editor-area {
    flex-grow: 1;
    position: relative;
}

.summary {
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