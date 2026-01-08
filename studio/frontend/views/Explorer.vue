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
        <el-tree style="border-radius: 5px;border: 1px solid var(--border-color);" :data="treeData" :props="treeProps"
            @node-click="handleNodeClick">
            <template #default="{ node }">
                <span class="custom-tree-node">
                    <el-icon>
                        <Folder v-if="!node.isLeaf" />
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
} from '@element-plus/icons-vue';
import { ref } from 'vue';
import { languages } from '../languages';



const searchInput = ref('');
const languageInput = ref('');

const treeData = ref([
    {
        label: 'STUDIO/i18n',
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
}
</style>