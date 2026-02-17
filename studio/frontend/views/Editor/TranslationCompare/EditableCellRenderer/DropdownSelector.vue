<template>
    <el-dropdown trigger="hover">
        <span style="user-select: none;cursor: pointer;" class="variable">
            {{ modelValue || placeholder }}
        </span>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="emit('update:modelValue', option)" v-for="option in options">
                    <span style="user-select: none;" class="variable">
                        {{ option }}
                    </span>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script lang="ts" setup>
import {
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
} from 'element-plus';

const props = defineProps<{
    modelValue: string;
    placeholder: string;
    options: string[];
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

</script>

<style></style>