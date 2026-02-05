<template>
    <div class="text-cell-renderer" title="原文只能让开发者在源代码中修改">
        <template v-for="(part, index) in parts" :key="index">
            <span v-if="part.type === 'placeholder'" class="placeholder">{{ part.content }}</span>
            <span v-else>{{ part.content }}</span>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { splitTextWithPlaceholders } from '../../../utils/textUtils';

const props = defineProps<{
    text: string;
}>();

const parts = computed(() => splitTextWithPlaceholders(props.text));
</script>

<style scoped>
.text-cell-renderer {
    padding: 0 11px;
    height: 32px;
    line-height: 32px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    width: calc(var(--col-width) - 16px);
    box-sizing: border-box;
    display: flex;
    align-items: center;
}

.placeholder {
    background-color: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    border-radius: 4px;
    padding: 2px 5px;
    margin: 0 2px;
    font-weight: bold;
    display: inline-block;
    line-height: 1.2;
}
</style>
