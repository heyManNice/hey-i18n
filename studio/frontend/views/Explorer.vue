<template>
    <div class="container">
        <div class="brand">
            hey-i18n-studio
        </div>
        <el-input v-model="searchInput" placeholder="搜索现有资源" :prefix-icon="Search" />
        <div class="add-language-container">
            <el-autocomplete v-model="languageInput" :fetch-suggestions="querySearch" placeholder="添加语言资源" />
            <el-button>添加</el-button>
        </div>
        <el-button @click="handleSacnProjectText">扫描项目原文</el-button>
        <el-tree style="border-radius: 5px;border: 1px solid var(--border-color);" :data="treeData" :props="treeProps"
            @node-click="handleNodeClick" default-expand-all>
            <template #default="{ node }">
                <span class="custom-tree-node">
                    <el-icon>
                        <FolderOpened v-if="!node.isLeaf && node.expanded" />
                        <Folder v-else-if="!node.isLeaf && !node.expanded" />
                        <Document v-else />
                    </el-icon>
                    <span>{{ node.label }}</span>
                </span>
            </template>
        </el-tree>
    </div>
</template>

<script setup lang="ts">
import {
    ElInput,
    ElAutocomplete,
    ElButton,
    ElTree,
    ElIcon
} from 'element-plus';
import {
    Search,
    Document,
    Folder,
    FolderOpened,
} from '@element-plus/icons-vue';
import { ref } from 'vue';
import { languages } from '../consts/languages';

import mSystemBar from '../models/SystemBar';


const searchInput = ref('');
const languageInput = ref('');

const treeData = ref([
    {
        label: 'STUDIO/i18n (原文 zh-CN)',
        children: [
            { label: 'en-US.json' },
            { label: 'fr-FR.json' },
            { label: 'ja-JP.json' },
        ],
    }
]);

const treeProps = {
    children: 'children',
    label: 'label',
};

interface Tree {
    label: string
    children?: Tree[]
}

const handleNodeClick = (data: Tree) => {
    console.log(data)
};

const querySearch = (queryString: string, cb: any) => {
    const results = queryString
        ? languages.filter((language: string) => (language.indexOf(queryString) != -1))
        : languages

    cb(results.map(item => ({ value: item })))
}

function handleSacnProjectText() {
    mSystemBar.status.setProgress(63, '63% 已扫描 23/36 文件: src/components/Example.vue');
}

</script>

<style scoped>
.container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: var(--muted-text-color);
}

.brand {
    font-size: 18px;
    font-weight: bold;
    color: var(--text-color);
}

.add-language-container {
    display: flex;
    gap: 10px;
}

.custom-tree-node {
    display: flex;
    align-items: center;
    gap: 5px;
    overflow: hidden;
    margin-left: 10px;
}

:deep(.el-tree-node__expand-icon) {
    display: none;
}
</style>