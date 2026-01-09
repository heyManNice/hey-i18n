<template>
    <div class="item">
        <el-icon v-if="isLoading" class="is-loading">
            <Loading />
        </el-icon>
        <el-icon v-else-if="hasIconSlot">
            <slot name="icon"></slot>
        </el-icon>
        <el-progress v-if="typeof progress === 'number'" :percentage="progress" :show-text="false"
            style="width: 100px;" />
        <span>{{ text }}</span>
    </div>
</template>

<script setup lang="ts">
import {
    useSlots
} from 'vue';
import {
    ElIcon,
    ElProgress,
} from 'element-plus';
import {
    Loading,
} from '@element-plus/icons-vue';

const slots = useSlots();
const hasIconSlot = !!slots.icon;

const prop = withDefaults(defineProps<{
    text: string;
    isLoading?: boolean;
    progress?: number;
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