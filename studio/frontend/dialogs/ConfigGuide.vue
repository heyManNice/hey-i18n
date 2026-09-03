<template>
    <div class="container">
        <div class="title">该项目还没有初始化 i18n 目录</div>
        <el-form>
            <el-form-item label="项目源语言" title="开发者在代码中编写的原始字符串语言">
                <el-select v-model="sourcesLocale">
                    <el-option v-for="local in languages" :key="local" :label="local" :value="local" />
                </el-select>
            </el-form-item>
            <el-form-item label="提示">
                <span style="color: var(--muted-text-color)">你可以随时在设置中重新指定该设置。</span>
            </el-form-item>
        </el-form>
        <div class="buttons">
            <el-button style="margin-left: 0px" @click="confirm()" type="primary">确认</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ElButton, ElForm, ElFormItem, ElSelect, ElOption } from 'element-plus';

import backend from '../rpc/backend';

import { ref } from 'vue';

import { languages } from '../consts/languages';

const sourcesLocale = ref('zh-CN');

async function confirm() {
    await backend.config.initConfig(sourcesLocale.value);
    await backend.explorer.scanI18nStrings();
    location.reload();
}
</script>

<style>
.container {
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.title {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 1rem;
}

.buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
