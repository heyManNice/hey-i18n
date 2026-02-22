<template>
    <el-form label-width="auto">
        <el-form-item label="项目源语言" title="开发者在代码中编写的原始字符串语言">
            <el-select v-model="sourceLocale">
                <el-option v-for="local in languages" :key="local" :label="local" :value="local" />
            </el-select>
        </el-form-item>
        <el-form-item label="用户初始语言" title="用户首次进入时显示的语言，可设置为自动检测或固定语言">
            <el-select model-value="自动">
            </el-select>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import {
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption
} from 'element-plus';

import {
    ref
} from 'vue';

import {
    languages
} from '../../consts/languages';

// 项目源语言选项
const sourceLocale = ref('zh-CN');
</script>