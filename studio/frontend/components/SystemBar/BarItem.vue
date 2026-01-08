<template>
    <div class="item">
        <el-icon v-if="isLoading" class="is-loading">
            <Loading />
        </el-icon>
        <el-icon v-else>
            <slot name="icon"></slot>
        </el-icon>
        <span>{{ text }}</span>
    </div>
</template>

<script setup lang="ts">
import {
    ElIcon
} from 'element-plus';
import {
    Loading,
} from '@element-plus/icons-vue';

const prop = withDefaults(defineProps<{
    text: string;
    isLoading?: boolean;
}>(), {
    isLoading: false,
});
</script>

<style scoped>
.item {
    display: flex;
    align-items: center;
    gap: 5px;
}
</style>