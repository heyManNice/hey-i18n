<template>
    <el-form label-width="auto">
        <el-form-item label="AI 翻译接口来源">
            <el-select placeholder="选择翻译接口来源">
                <el-option value="hey-i18n-ai">
                    <span>hey-i18n 官方平台</span>
                    <el-tag style="margin-left: 5px;" size="small">0 配置</el-tag>
                    <el-tag style="margin-left: 5px;" size="small">付费</el-tag>
                </el-option>
                <el-option value="third-party">
                    <span>第三方 API 平台</span>
                    <el-tag style="margin-left: 5px;" size="small">自配置</el-tag>
                    <el-tag style="margin-left: 5px;" size="small">性价比</el-tag>
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="API 平台">
            <el-select placeholder="选择第三方 API 平台">
                <el-option label="火山引擎 Ark" value="volcanoark"></el-option>
                <el-option label="OpenAI" value="openai"></el-option>
                <el-option label="阿里云白炼" value="model-studio"></el-option>
                <el-option label="智普 AI" value="zai"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="API Key">
            <el-input placeholder="请输入平台提供的 API Key" />
        </el-form-item>
        <el-form-item label="模型标识">
            <el-input placeholder="请输入对应平台的模型名称或 ID" />
        </el-form-item>
        <el-form-item label="测试">
            <el-button>测试连接</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import {
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElInput,
    ElButton,
    ElTag
} from 'element-plus';
</script>