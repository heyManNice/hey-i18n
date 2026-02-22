<template>
    <el-form label-width="auto">
        <el-form-item label="界面语言">
            <div style="display: flex;gap: 10px;flex: 1;">
                <el-select model-value="简体中文">
                    <el-option label="简体中文" value="zh-CN"></el-option>
                    <el-option label="English" value="en-US"></el-option>
                </el-select>
                <el-button @click="reload">
                    重载后生效
                </el-button>
            </div>
        </el-form-item>
        <el-form-item label="提示">
            <span style="color: var(--muted-text-color);">你可以点击背景的灰白处关闭设置面板。</span>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import {
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElButton
} from 'element-plus';

// 重载
function reload() {
    window.location.reload();
}
</script>