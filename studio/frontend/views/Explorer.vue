<template>
    <div class="container">
        <!-- logo -->
        <div class="brand">
            <span>
                hey-i18n-studio
            </span>
            <el-button @click="settings.open()" :icon="Setting"></el-button>
        </div>
        <!-- 筛选搜索框 -->
        <el-input v-model="mExplorer.mTreeSearch" placeholder="搜索现有资源" :prefix-icon="Search" />
        <!-- 添加语言资源文件框 -->
        <div class="add-lang-container">
            <el-autocomplete v-model="mExplorer.mAddLangInput" :fetch-suggestions="mExplorer.fFetchLangSug"
                placeholder="创建语言资源" />
            <el-button @click="addLangFile">创建</el-button>
        </div>
        <el-button @click="scanProject">扫描项目原文</el-button>
        <!-- 资源文件列表 -->
        <el-tree v-if="!r.e" v-loading="r.l" class="tree" :data="r.d?.treeData" @node-click="nodeClick"
            default-expand-all>
            <template #default="{ node }">
                <span class="tree-node">
                    <el-icon>
                        <FolderOpened v-if="node.data.isDir && node.expanded" />
                        <Folder v-else-if="node.data.isDir && !node.expanded" />
                        <Document v-else />
                    </el-icon>
                    <span>
                        {{ node.label }}
                        <span v-if="Object.keys(mEditor.mChangeData[node.label] || {}).length > 0">*</span>
                    </span>
                </span>
            </template>
        </el-tree>
        <p v-if="r.e">{{ r.e }}</p>
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
    Setting
} from '@element-plus/icons-vue';

import settings from '../pages/settings/settings';

import backend from '../rpc/backend';

import { Notify } from '../models/SystemBar';
import mEditor from '../models/Editor';
import mExplorer from '../models/Explorer';

import { useExplorerData } from '../models/Explorer';

const r = useExplorerData();

async function addLangFile() {
    const filename = mExplorer.mAddLangInput.trim();
    if (filename === '') {
        return Notify.fail('请输入语言名称');
    }
    Notify.loading(`正在创建语言文件：${filename}.json...`);
    backend.explorer.addI18nFile(`${filename}.json`).then(() => {
        mExplorer.mAddLangInput = '';
        r.update();
        Notify.ok(`已创建语言文件：${filename}.json`)
    }).catch((error) => {
        if (!(error instanceof Error)) {
            throw error;
        }
        Notify.fail(`创建语言文件失败：${error.message}`);
    });
}

function nodeClick(data: NonNullable<typeof r.d>["treeData"][number]) {
    if (data.isDir) {
        return;
    }
    const filename = data.label;
    mEditor.fAddTab(filename);
};

function scanProject() {
    Notify.progress(30);
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
    display: flex;
    justify-content: space-between;
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