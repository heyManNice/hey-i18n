<template>
    <div>
        <span>项目原文 (zh-CN)</span>
        <ElInput :model-value="modelValue" :placeholder="`搜索原文`" :prefix-icon="Search" clearable size="small"
            @update:modelValue="(value: string) => { emits('update:modelValue', value) }" />
    </div>
</template>

<script setup lang="ts">
import { ElInput } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const props = defineProps<{
    modelValue: string;
}>();

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

</script>

<style scoped>
div {
    display: flex;
    gap: 15px;
}

span {
    white-space: nowrap;
}
</style>