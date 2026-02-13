<template>
    <div class="container">
        <!-- 总结的数据 -->
        <div class="summary">
            <span>已翻译: {{ r.d?.summary.translatedCount ?? '-' }}</span>
            <span>总计: {{ r.d?.summary.totalCount ?? '-' }}</span>
            <span>失效的键: {{ r.d?.summary.invalidKeysCount ?? '-' }}</span>
            <span>正在修改：{{ r.d?.summary.editingCount ?? '-' }}</span>
            <div class="filter">
                <el-select :model-value="r.d?.filter.option" @update:model-value="val => {
                    if (r.d) { r.d.filter.option = val }
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
            <el-button plain>AI 翻译</el-button>
            <el-button :disabled="r.d?.summary.editingCount === 0" style="margin-left: 0px;" type="primary"
                plain>保存</el-button>
        </div>
        <!-- 编辑内容的表格 -->
        <div class="table">
            <div style="position: absolute; width: 100%;">
                <el-table v-loading="r.l" v-if="!r.e" :data="r.d?.filter.result" :row-key="(row) => row.untranslated.key">
                    <!-- 项目原来的翻译列 -->
                    <el-table-column min-width="45">
                        <template #header>
                            <HeaderCellRenderer :search-input="r.d?.filter.sourceSearch"
                                :label="`项目原文 (${mExplorer.mSourceLocale})`" search-placeholder="搜索原文"
                                @update:searchInput="val => { if (r.d) { r.d.filter.sourceSearch = val } }" />
                        </template>
                        <template #default="scope">
                            <TextCellRenderer :item="scope.row.untranslated" style="cursor: not-allowed;" />
                        </template>
                    </el-table-column>
                    <!-- 目标翻译的列 -->
                    <el-table-column min-width="55">
                        <template #header>
                            <HeaderCellRenderer :search-input="r.d?.filter.targetSearch"
                                :label="`目标译文 (${targetLocal})`" search-placeholder="搜索译文"
                                @update:searchInput="val => { if (r.d) { r.d.filter.targetSearch = val } }" />
                        </template>
                        <template #default="scope">
                            <EditableCellRenderer :item="scope.row.translated" :source-item="scope.row.untranslated" />
                        </template>
                    </el-table-column>
                </el-table>
                <p v-if="r.e">{{ r.e }}</p>
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

import HeaderCellRenderer from './TranslationCompare/HeaderCellRenderer.vue';
import TextCellRenderer from './TranslationCompare/TextCellRenderer.vue';
import EditableCellRenderer from './TranslationCompare/EditableCellRenderer.vue';

import mEditor from '../../models/Editor';
import mExplorer from '../../models/Explorer';

import { useTranslationData } from '../../models/Editor';

const filename = mEditor.mActiveTab;
const r = useTranslationData(filename);

// local.json中获取local
const targetLocal = filename.split('.')[0];
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 10px;
    padding: 0px 10px;
    background-color: var(--panel-bg-color);
    color: var(--text-color);
}

.table {
    flex-grow: 1;
    position: relative;
}

.summary {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px 0px;
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

:global(.variable) {
    background-color: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    border-radius: 4px;
    padding: 2px 5px;
    margin: 0 2px;
    font-weight: bold;
    display: inline;
    line-height: 1.2;
    cursor: default;
    user-select: all;
    -webkit-user-select: all;
}

:deep(.el-table__row .el-table__cell) {
    vertical-align: top;
}
</style>