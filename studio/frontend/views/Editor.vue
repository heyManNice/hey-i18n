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
            <TranslationCompare />
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    ElTabs,
    ElTabPane,
    ElIcon,
    type TabPaneName
} from 'element-plus';

import { Document } from '@element-plus/icons-vue';

import TranslationCompare from '../components/Editor/TranslationCompare.vue';

const editableTabsValue = ref('1');
const editableTabs = ref([
    {
        title: 'en-US.json',
        name: '1',
        content: 'Content of en-US.json',
    },
    {
        title: 'fr-FR.json',
        name: '2',
        content: 'Content of fr-FR.json',
    },
    {
        title: 'ja-JP.json',
        name: '3',
        content: 'Content of ja-JP.json',
    },
]);

let tabIndex = 3;

const addTab = (targetName: string) => {
    const newTabName = `${++tabIndex}`;
    editableTabs.value.push({
        title: 'New Tab',
        name: newTabName,
        content: 'New Tab content',
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
</style>