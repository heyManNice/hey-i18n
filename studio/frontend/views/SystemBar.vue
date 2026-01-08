<template>
    <div class="system-bar">
        就绪
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
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    font-size: 12px;
}
</style>