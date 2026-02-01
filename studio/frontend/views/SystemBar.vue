<template>
    <div class="system-bar">
        <div class="left">
            <BarItem text="hey-i18n-studio">
                <template #icon>
                    <Folder />
                </template>
            </BarItem>

            <BarItem v-if="mSystemBar.status.m_isComplete.value" :text="mSystemBar.status.m_completeText.value">
                <template #icon>
                    <Check />
                </template>
            </BarItem>

            <BarItem v-if="!mSystemBar.status.m_isComplete.value" :text="mSystemBar.status.m_progressText.value"
                :progress="mSystemBar.status.m_progress.value" />

        </div>
        <div class="right">
            <BarItem text="zh-CN">
                <template #icon>
                    <Files />
                </template>
            </BarItem>
            <BarItem :text="mSystemBar.lastScanTime.m_lastScanTime.value">
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
    Timer
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