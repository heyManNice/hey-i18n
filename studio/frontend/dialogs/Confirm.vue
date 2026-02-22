<template>
    <div class="container">
        <div class="title">{{ title }}</div>
        <div class="message">{{ message }}</div>
        <div class="buttons">
            <el-button @click="emit('cancel')">取消</el-button>
            <el-button @click="emit('confirm')" type="primary">确认</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ElButton
} from 'element-plus';

const emit = defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();

const props = defineProps<{
    title: string;
    message: string;
}>();
</script>

<style scoped>
.container {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.title {
    font-size: 1.1rem;
    font-weight: 500;
}

.message {
    font-size: 0.9rem;
    color: var(--muted-text-color);
}

.buttons {
    display: flex;
    justify-content: flex-end;
}
</style>