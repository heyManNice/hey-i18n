<template>
    <el-form v-if="!r.e" v-loading="r.l" label-width="auto">
        <el-form-item label="项目源语言" title="开发者在代码中编写的原始字符串语言">
            <el-select :model-value="r.d?.sourcesLocale" @change="(v) => { if (r.d) r.d.sourcesLocale = v; }">
                <el-option v-for="local in languages" :key="local" :label="local" :value="local" />
            </el-select>
        </el-form-item>
        <el-form-item label="用户初始语言" title="用户首次进入时显示的语言，可设置为自动检测或固定语言">
            <el-select :model-value="r.d?.defaultLocale" @change="(v) => { if (r.d) r.d.defaultLocale = v; }">
                <el-option label="跟随系统" value="system" />
                <el-option v-for="local in availableLocales" :key="local" :label="local" :value="local" />
            </el-select>
        </el-form-item>
    </el-form>
    <p v-if="r.e">{{ r.e }}</p>
</template>

<script setup lang="ts">
import {
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption
} from 'element-plus';

import {
    computed,
} from 'vue';

import {
    languages
} from '../../consts/languages';

import mExplorer from '../../models/Explorer';
import { useProjectData } from '../../models/dialogs/Settings/Project';

// 给当前组件单独注册指令
import { vLoading } from 'element-plus';
defineOptions({
    directives: {
        loading: vLoading
    }
});

// 可用的语言
const availableLocales = computed(() => {
    const locales = new Set<string>();
    for (const file of mExplorer.mI18nFiles) {
        locales.add(file.split('.')[0]);
    }
    // 再添加一个原文
    locales.add(mExplorer.mSourceLocale);
    return Array.from(locales);
});

const r = useProjectData();
</script>