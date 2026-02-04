<template>
    <el-tabs v-model="editableTabsValue" type="border-card" closable @tab-remove="removeTab"
        style="flex: 1;background-color: var(--panel-bg-color);">
        <el-tab-pane v-for="item in editableTabs" :key="item.name" :label="item.title" :name="item.name">
            <template #label>
                <span class="custom-tab-label">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>{{ item.title }}</span>
                </span>
            </template>
            <TranslationCompare :target-locale="editableTabsTitle" />
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
    ElTabs,
    ElTabPane,
    ElIcon,
    type TabPaneName
} from 'element-plus';

import { Document } from '@element-plus/icons-vue';

import TranslationCompare from './Editor/TranslationCompare.vue';

import bus from '../utils/bus';

const editableTabsValue = ref('1');
const editableTabsTitle = computed(() => {
    const currentTab = editableTabs.value.find(tab => tab.name === editableTabsValue.value);
    return currentTab ? currentTab.title : 'null';
});
const editableTabs = ref([
    {
        title: 'en-US.json',
        name: '1',
    }
]);

bus.on('editor-add-tab', ({ filename }) => {
    addTab(filename);
});

let tabIndex = 1;

const addTab = (targetName: string) => {
    // 重复的不添加，并且聚焦
    const existingTab = editableTabs.value.find(tab => tab.title === targetName);
    if (existingTab) {
        editableTabsValue.value = existingTab.name;
        return;
    }
    const newTabName = `${++tabIndex}`;
    editableTabs.value.push({
        title: targetName,
        name: newTabName,
    });
    editableTabsValue.value = newTabName;
};

const removeTab = (targetName: TabPaneName) => {
    const tabs = editableTabs.value;
    let activeName = editableTabsValue.value;
    if (activeName === targetName) {
        tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
                const nextTab = tabs[index + 1] || tabs[index - 1];
                if (nextTab) {
                    activeName = nextTab.name;
                }
            }
        });
    }

    editableTabsValue.value = activeName;
    editableTabs.value = tabs.filter((tab) => tab.name !== targetName);
};
</script>

<style scoped>
.custom-tab-label {
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