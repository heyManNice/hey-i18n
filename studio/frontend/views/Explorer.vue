<template>
    <div class="container">
        <!-- logo -->
        <div class="brand">
            hey-i18n-studio
        </div>
        <!-- 筛选搜索框 -->
        <el-input v-model="mExplorer.mTreeSearch" placeholder="搜索现有资源" :prefix-icon="Search" />
        <!-- 添加语言资源文件框 -->
        <div class="add-lang-container">
            <el-autocomplete v-model="mExplorer.mAddLangInput" :fetch-suggestions="mExplorer.fFetchLangSug"
                placeholder="添加语言资源" />
            <el-button @click="addLangFile">添加</el-button>
        </div>
        <el-button @click="handleSacnProject">扫描项目原文</el-button>
        <!-- 资源文件列表 -->
        <el-tree class="tree" :data="r.d?.treeData" :props="treeProps" @node-click="handleNodeClick" default-expand-all>
            <template #default="{ node }">
                <span class="tree-node">
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

import backend from '../rpc/backend';

import mSystemBar from '../models/SystemBar';
import mEditor from '../models/Editor';
import mExplorer from '../models/Explorer';

import { useExplorerData } from '../models/Explorer';

const r = useExplorerData();

async function addLangFile() {
    const filename = mExplorer.mAddLangInput.trim();
    if (filename === '') {
        return;
    }
    backend.explorer.addI18nFile(`${filename}.json`).then(() => {
        mExplorer.mAddLangInput = '';
        r.update();
        mSystemBar.cStatus.fSetComplete(`已添加语言文件：${filename}.json`);
    }).catch((error) => {
        if (!(error instanceof Error)) {
            throw error;
        }
        mSystemBar.cStatus.fSetError(`添加语言文件失败：${error.message}`);
    });
}

const treeProps = {
    children: 'children',
    label: 'label',
};

function handleNodeClick(data: typeof treeProps) {
    if (data.children && data.children.length > 0) {
        return;
    }
    const filename = data.label;
    mEditor.fAddTab(filename);
};

function handleSacnProject() {
    mSystemBar.cStatus.fSetProgress(30, '初始化扫描...');
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

.tree {
    border-radius: 5px;
    border: 1px solid var(--border-color);
}

.add-lang-container {
    display: flex;
    gap: 10px;
}

.tree-node {
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