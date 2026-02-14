<template>
    <el-tabs v-if="mEditor.mTabs.length > 0" v-model="mEditor.mActiveTab" type="border-card" closable @tab-remove="(fielname: TabPaneName) => {
        mEditor.fRemoveTab(fielname.toString());
    }" class="tabs">
        <el-tab-pane v-for="item in mEditor.mTabs" :key="item.filename" :label="item.filename" :name="item.filename"
            style="height: 100%;">
            <template #label>
                <span class="tab-label">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>
                        <span v-if="Object.keys(mEditor.mChangeData[item.filename] || {}).length > 0">*</span>
                        {{ item.filename }}
                    </span>
                </span>
            </template>
            <TranslationCompare />
        </el-tab-pane>
    </el-tabs>
    <div class="tabs-empty" v-if="mEditor.mTabs.length === 0">
        <span style="font-size: 3rem;font-weight: 700;">hey-i18n-studio</span>
        <br>
        <span>还没有打开语言资源，请选择或创建一个语言资源开始翻译。</span>
        <span></span>
    </div>
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
.tabs {
    flex: 1;
    background-color: var(--panel-bg-color);
    width: 100%;
}

.tab-label {
    display: flex;
    align-items: center;
    gap: 5px;
}

.tabs-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    color: var(--muted-text-color);
    translate: 0 -5%;
}

/* 移除 Tab 切换动画，使其感觉更灵敏 */
:deep(.el-tabs__item),
:deep(.el-tabs__active-bar),
:deep(.el-tabs__nav-wrap) {
    transition: none !important;
}
</style>