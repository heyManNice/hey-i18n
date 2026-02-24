<template>
    <div class="container">
        <!-- 总结的数据 -->
        <div class="summary">
            <span>已翻译: {{ r.d?.summary.translatedCount ?? '-' }}</span>
            <span>总计: {{ r.d?.summary.totalCount ?? '-' }}</span>
            <span>失效的键: {{ r.d?.summary.invalidKeysCount ?? '-' }}</span>
            <span>正在修改：{{ r.d?.summary.editingCount ?? '-' }}</span>
            <div class="filter">
                <el-select :disabled="Boolean(r.e)" :model-value="r.d?.filter.option" @update:model-value="val => {
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
            <el-button :disabled="Boolean(r.e)" plain>AI 翻译</el-button>
            <el-button :disabled="Boolean(r.e)" @click="deleteBtnClick" style="margin-left: 0px;" type="danger"
                plain>删除</el-button>
            <el-button :disabled="Boolean(r.e) || r.d?.summary.editingCount === 0" style="margin-left: 0px;"
                type="primary" plain @click="saveBtnClick">保存</el-button>
        </div>
        <!-- 编辑内容的表格 -->
        <div class="table">
            <div style="position: absolute; width: 100%;height: 100%;">
                <el-table v-loading="r.l" v-if="!r.e" :data="r.d?.filter.result"
                    :row-key="(row) => row.untranslated.key" style="height: 100%;">
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
                            <EditableCellRenderer :item="scope.row.translated" :source-item="scope.row.untranslated"
                                :filename="props.filename" />
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
import mSystemBar, { Notify } from '../../models/SystemBar';
import { confirm } from '../../dialogs/dialogs';

import {
    watch
} from 'vue';

const props = defineProps<{
    filename: string;
}>();

const filename = props.filename;

const r = useTranslationData(filename);

// 当原文的键扫描时间更新时，重新获取翻译数据
watch(() => mSystemBar.cScanTime.mTimestamp, () => {
    r.update();
});

// local.json中获取local
const targetLocal = filename.split('.')[0];

function saveBtnClick() {
    Notify.loading(`正在保存 ${filename}...`);
    mEditor.fSaveFile(filename)?.then(() => {
        Notify.ok(`更新 ${filename} 的 ${Object.keys(mEditor.mChangeData[filename]).length} 条翻译成功.`);
        r.update();
        // 保存成功后，清除修改数据
        delete mEditor.mChangeData[filename];
        // 更新文件列表进度条
        mExplorer.fUpdateFiles();
    }).catch((err) => {
        Notify.fail(`更新 ${filename} 失败: ${err.message}`);
    });
}

// 点击删除按钮的处理函数
async function deleteBtnClick() {
    Notify.loading(`正在删除 ${filename}...`);
    const isDel = await confirm(`确定要删除 ${filename} 吗？`, `${filename} 将会永久消失！(真的很久！)`);
    if (!isDel) {
        return;
    }
    mEditor.fDeleteFile(filename).then(() => {
        mEditor.fRemoveTab(filename);
        Notify.ok(`成功删除 ${filename}`);
        mExplorer.fUpdateFiles();
    }).catch((err) => {
        Notify.fail(`删除 ${filename} 失败: ${err.message}`);
    });
}
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