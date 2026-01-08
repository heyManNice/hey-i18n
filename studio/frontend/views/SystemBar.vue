<template>
    <div class="system-bar">
        <div class="left">
            <BarItem text="hey-i18n-studio">
                <template #icon>
                    <FolderOpened />
                </template>
            </BarItem>

            <BarItem text="就绪">
                <template #icon>
                    <Check />
                </template>
            </BarItem>

        </div>
        <div class="right">
            <BarItem text="zh-CN">
                <template #icon>
                    <Files />
                </template>
            </BarItem>
            <BarItem text="上次扫描时间: 2024-06-01 12:00">
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
    FolderOpened,
    Flag,
    Timer
} from '@element-plus/icons-vue';

import BarItem from '../components/SystemBar/BarItem.vue';

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