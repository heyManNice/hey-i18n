<template>
    <el-tabs v-model="currentTabLable" type="border-card" closable
        style="flex: 1;background-color: var(--panel-bg-color);" @tab-remove="removeTab">
        <el-tab-pane v-for="item in tabs" :key="item.lable" :label="item.lable" :name="item.lable">
            <template #label>
                <span class="tab-label">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>{{ item.lable }}</span>
                </span>
            </template>
            <TranslationCompare :target-locale="currentTabLable" />
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import {
    ref
} from 'vue';
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
import bus from '../utils/bus';

// Tab数据值
const tabs = ref<{
    lable: string
}[]>([]);

// 当前编辑的 Tab 标签
const currentTabLable = ref('');

bus.on('editor-add-tab', ({ filename }) => {
    const existingTab = tabs.value.find(tab => tab.lable === filename);
    if (existingTab) {
        currentTabLable.value = existingTab.lable;
        return;
    }
    tabs.value.push({
        lable: filename
    });
    currentTabLable.value = filename;
});

// 删除标签
function removeTab(targetName: TabPaneName) {
    const index = tabs.value.findIndex(tab => tab.lable === targetName);
    if (index !== -1) {
        tabs.value.splice(index, 1);
        // 如果删除的是当前标签，切换到第一个标签
        if (currentTabLable.value === targetName) {
            currentTabLable.value = tabs.value.length > 0 ? tabs.value[0].lable : '';
        }
    }
}

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