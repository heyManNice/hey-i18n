<template>
    <el-tabs v-model="mEditor.mActiveTab" type="border-card" closable
        style="flex: 1;background-color: var(--panel-bg-color);" @tab-remove="(fielname: TabPaneName) => {
            mEditor.fRemoveTab(fielname.toString());
        }">
        <el-tab-pane v-for="item in mEditor.mTabs" :key="item.filename" :label="item.filename" :name="item.filename">
            <template #label>
                <span class="tab-label">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>{{ item.filename }}</span>
                </span>
            </template>
            <TranslationCompare />
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import {
    ElTabs,
    ElTabPane,
    ElIcon,
    type TabPaneName
} from 'element-plus';
import {
    Document
} from '@element-plus/icons-vue';
import TranslationCompare from './Editor/TranslationCompare.vue';
import mEditor from '../models/Editor';

</script>

<style scoped>
.tab-label {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* 移除 Tab 切换动画，使其感觉更灵敏 */
:deep(.el-tabs__item),
:deep(.el-tabs__active-bar),
:deep(.el-tabs__nav-wrap) {
    transition: none !important;
}
</style>