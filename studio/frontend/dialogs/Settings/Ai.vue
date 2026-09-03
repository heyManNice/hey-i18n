<template>
    <el-form v-if="!r.e" v-loading="r.l" label-width="auto">
        <el-form-item label="AI 翻译接口来源">
            <el-select
                :model-value="r.d?.provider"
                style="width: 100%"
                @update:model-value="(v) => v && r.d && (r.d.provider = v)"
            >
                <el-option label="hey-i18n 官方平台（即将开放）" value="hey-i18n-ai"></el-option>
                <el-option label="第三方 API 平台" value="third-party"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="API 平台">
            <el-select
                :disabled="r.d?.provider !== 'third-party'"
                :model-value="r.d?.platform"
                style="width: 100%"
                @update:model-value="(v) => v && r.d && (r.d.platform = v)"
            >
                <el-option label="OpenAI" value="openai"></el-option>
                <el-option label="火山引擎 Ark" value="volcanoark"></el-option>
                <el-option label="阿里云百炼" value="model-studio"></el-option>
                <el-option label="智谱 AI" value="zai"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="API Key">
            <el-input
                v-model="apiKeyInput"
                :placeholder="r.d?.hasApiKey ? '已配置（留空表示保持不变）' : '请输入平台提供的 API Key'"
                show-password
                type="password"
            />
        </el-form-item>
        <el-form-item label="模型标识">
            <el-input
                :model-value="r.d?.model"
                placeholder="请输入对应平台的模型名称或 ID"
                @update:model-value="(v) => v !== undefined && r.d && (r.d.model = v)"
            />
        </el-form-item>
        <el-form-item>
            <el-button :loading="testing" @click="handleTest">测试连接</el-button>
            <el-button :loading="saving" type="primary" @click="handleSave">保存配置</el-button>
        </el-form-item>
        <el-form-item v-if="testResult.message">
            <span :class="testResult.ok ? 'ok' : 'error'">{{ testResult.message }}</span>
        </el-form-item>
    </el-form>
    <p v-else>{{ r.e }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElForm, ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus';

import { Notify } from '../../models/SystemBar';
import { useAiData } from '../../models/dialogs/Settings/Ai';

const { r, apiKeyInput, testResult, save, testConnection } = useAiData();
const saving = ref(false);
const testing = ref(false);

async function handleSave() {
    saving.value = true;
    try {
        await save();
        Notify.ok('AI 配置已保存');
    } catch (error) {
        Notify.fail(`保存 AI 配置失败：${(error as Error).message}`);
    } finally {
        saving.value = false;
    }
}

async function handleTest() {
    testing.value = true;
    await testConnection();
    testing.value = false;
}
</script>

<style scoped>
.ok {
    color: var(--el-color-success);
}

.error {
    color: var(--el-color-danger);
}
</style>
