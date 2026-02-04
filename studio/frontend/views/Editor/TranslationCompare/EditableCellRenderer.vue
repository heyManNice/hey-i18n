<template>
    <div class="editable-cell-renderer">
        <el-input v-if="isEditing" ref="inputRef" v-model="internalValue" @blur="handleBlur" />
        <text-cell-renderer v-else :text="modelValue" class="read-only-view" @click="handleClick" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { ElInput } from 'element-plus';
import TextCellRenderer from './TextCellRenderer.vue';

const props = defineProps<{
    modelValue: string;
    isEditing: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'edit-start'): void;
    (e: 'edit-end'): void;
}>();

const internalValue = ref(props.modelValue);
const inputRef = ref<InstanceType<typeof ElInput> | null>(null);

watch(() => props.modelValue, (newValue) => {
    internalValue.value = newValue;
});



// Auto focus when entering edit mode
watch(() => props.isEditing, (isEditing) => {
    if (isEditing) {
        internalValue.value = props.modelValue;
        nextTick(() => {
            inputRef.value?.focus();
        });
    }
});

// Watch internal value changes to emit updates
watch(internalValue, (newValue) => {
    if (newValue !== props.modelValue) {
        emit('update:modelValue', newValue);
    }
});

const handleClick = () => {
    emit('edit-start');
};

const handleBlur = () => {
    emit('edit-end');
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
