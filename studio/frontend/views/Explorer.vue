<template>
    <div class="container">
        <div class="brand">
            hey-i18n-studio
        </div>
        <el-input v-model="searchInput" placeholder="搜索现有资源" :prefix-icon="Search" />
        <div class="add-language-container">
            <el-autocomplete v-model="languageInput" :fetch-suggestions="querySearch" placeholder="添加语言资源" />
            <el-button @click="addLanguageFile">添加</el-button>
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
import { ref, watch, onMounted } from 'vue';
import { languages } from '../consts/languages';

import mSystemBar from '../models/SystemBar';
import backend from '../rpc/backend';

onMounted(updateTreeData);

async function updateTreeData() {
    const project = backend.manager.project;
    const info = await project.listProjectInfo();
    const files = await project.listI18nFiles();

    console.log(info, files);

    if (files.length === 0) {
        return;
    }

    treeData.value = [
        {
            label: `${info.projectName}/${info.i18nDir} (原文 ${info.sourcesLocale})`,
            children: Array.from(files).map(file => ({ label: file })),
        }
    ]
}

const searchInput = ref('');
const languageInput = ref('');

async function addLanguageFile() {
    const filename = languageInput.value.trim();
    if (filename === '') {
        return;
    }

    try {
        await backend.manager.project.addI18nFile(`${filename}.json`);

    } catch (error) {
        if (!(error instanceof Error)) {
            throw error;
        }
        mSystemBar.status.setComplete(`添加语言文件失败：${error.message}`);
        return;
    }
    languageInput.value = '';
    await updateTreeData();
    mSystemBar.status.setComplete(`已添加语言文件：${filename}.json`);
}

const treeData = ref();

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

const totalFiles = 136;
const scannedFiles = ref(0);

function randomWord() {
    const words = [
        'components',
        'views',
        'models',
        'consts',
        'utils',
        'Explorer.vue',
        'SystemBar.vue',
        'languages.ts',
        'i18n.ts',
        'App.vue',
        'main.ts',
        'Cards.vue',
        'Header.vue',
        'Footer.vue',
    ];
    return words[Math.floor(Math.random() * words.length)];
}

watch(scannedFiles, (newVal) => {
    const progress = (newVal / totalFiles) * 100;
    const scanMsg = `${progress.toFixed(0)}% 已扫描 ${scannedFiles.value}/${totalFiles} 文件：src/${randomWord()}/${randomWord()}.vue`;
    mSystemBar.status.setProgress(progress, scanMsg);
});


function handleSacnProjectText() {
    scannedFiles.value = 0;
    mSystemBar.status.setProgress(1, '初始化扫描...');

    const interval = setInterval(() => {
        scannedFiles.value += 5;
        if (scannedFiles.value >= totalFiles) {
            scannedFiles.value = totalFiles;
            clearInterval(interval);
            setTimeout(() => {
                mSystemBar.status.setComplete(`扫描项目原文：完成，已处理 ${totalFiles} 个文件。新增 0 条，删除 0 条，共有 4 条原文。`);
                mSystemBar.lastScanTime.setLastScanTime(Date.now());
            });
        }
    }, 100);
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