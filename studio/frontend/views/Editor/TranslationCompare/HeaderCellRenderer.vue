<template>
    <div>
        <span>{{ label }}</span>
        <ElInput style="width: 200px;" :model-value="searchInput" :placeholder="searchPlaceholder" :prefix-icon="Search"
            clearable size="small" @update:modelValue="(value: string) => { emits('update:searchInput', value) }" />
    </div>
</template>

<script setup lang="ts">
import { ElInput } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const props = defineProps<{
    label: string | undefined;
    searchInput: string | undefined
    searchPlaceholder: string | undefined;
}>();

const emits = defineEmits<{
    (e: 'update:searchInput', value: string): void;
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