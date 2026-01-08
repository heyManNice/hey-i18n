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
    </div>
</template>

<script setup lang="ts">
import {
    ElInput,
    ElAutocomplete,
    ElButton,
} from 'element-plus';
import {
    Search,
} from '@element-plus/icons-vue';
import { ref } from 'vue';
import { languages } from '../languages';



const searchInput = ref('');
const languageInput = ref('');

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
</style>