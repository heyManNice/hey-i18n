<template>
    <div class="editable-cell-renderer">
        <el-input v-if="isEditing" ref="inputRef" v-model="internalValue" @blur="handleBlur" />
        <text-cell-renderer v-else :text="modelValue" class="read-only-view" @click="handleClick" />
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import { ElInput } from 'element-plus';
import TextCellRenderer from './TextCellRenderer.vue';

const props = defineProps<{
    modelValue: string;
}>();

const isEditing = ref(false);
const internalValue = ref(props.modelValue);

onMounted(() => {
    internalValue.value = props.modelValue;
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const inputRef = ref<InstanceType<typeof ElInput> | null>(null);

watch(internalValue, (newValue) => {
    emit('update:modelValue', newValue);
});

const handleClick = () => {
    isEditing.value = true;
    nextTick(() => {
        inputRef.value?.focus();
    });
};

const handleBlur = () => {
    isEditing.value = false;
};
</script>

<style scoped>
.read-only-view {
    cursor: pointer;
}

.editable-cell-renderer {
    width: calc(var(--col-width) - 10px);
}
</style>
