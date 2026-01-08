<template>
    <div class="system-bar">
        System Bar
    </div>
</template>
<script setup lang="ts">
</script>

<style scoped>
.system-bar {
    --system-bar-height: 20px;
    height: var(--system-bar-height);
    line-height: var(--system-bar-height);
    padding: 0px 10px;
    background-color: var(--el-color-primary-light-9);
    font-size: 12px;
}
</style>