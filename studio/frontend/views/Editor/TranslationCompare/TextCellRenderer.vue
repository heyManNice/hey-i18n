<template>
    <div class="text-cell-renderer" title="原文只能让开发者在源代码中修改">
        <template v-for="(part, index) in parts" :key="index">
            <span v-if="part.type === 'variable'" class="variable">{{ '{' + part.content + '}' }}</span>
            <span v-else>{{ part.content }}</span>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { mergeTextAndVariables } from '../../../utils/text-utils';

const props = defineProps<{
    item: {
        texts: string[];
        variables: string[];
    };
}>();

const parts = computed(() => mergeTextAndVariables(props.item.texts, props.item.variables));
</script>

<style scoped>
.text-cell-renderer {
    padding: 0 11px;
    min-height: 32px;
    line-height: 24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    user-select: text;
}
</style>
