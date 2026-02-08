<template>
    <div class="system-bar">
        <div class="left">
            <!-- 一些文字 -->
            <BarItem text="hey-i18n-studio">
                <template #icon>
                    <Folder />
                </template>
            </BarItem>

            <!-- 完成提示条 -->
            <BarItem v-if="mSystemBar.status.mStatus === 'complete'" :text="mSystemBar.status.mMessage">
                <template #icon>
                    <Check />
                </template>
            </BarItem>

            <!-- 错误提示 -->
            <BarItem v-if="mSystemBar.status.mStatus === 'error'" :text="mSystemBar.status.mMessage">
                <template #icon>
                    <Close />
                </template>
            </BarItem>

            <!-- 进度条提示 -->
            <BarItem v-if="mSystemBar.status.mStatus === 'progress'" :text="mSystemBar.status.mMessage"
                :progress="mSystemBar.status.mProgress" />

        </div>
        <div class="right">
            <BarItem text="zh-CN">
                <template #icon>
                    <Files />
                </template>
            </BarItem>
            <BarItem :text="mSystemBar.lastScanTime.mLastScanTime">
                <template #icon>
                    <Timer />
                </template>
            </BarItem>
            <BarItem text="v0.0.1">
                <template #icon>
                    <Flag />
                </template>
            </BarItem>
        </div>
    </div>
</template>
<script setup lang="ts">
import {
    Files,
    Check,
    Folder,
    Flag,
    Timer,
    Close
} from '@element-plus/icons-vue';

import BarItem from './SystemBar/BarItem.vue';

import mSystemBar from '../models/SystemBar';
</script>

<style scoped>
.system-bar {
    --system-bar-height: 20px;
    height: var(--system-bar-height);
    line-height: var(--system-bar-height);
    padding: 0px 10px;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    font-size: 12px;
    display: flex;
    justify-content: space-between;
}

.left,
.right {
    display: flex;
    gap: 10px;
    align-items: center;
}
</style>