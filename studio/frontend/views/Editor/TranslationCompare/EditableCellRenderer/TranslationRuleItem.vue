<template>
    <div style="display: flex;gap: 5px;white-space: nowrap;">
        <span>当</span>
        <DropdownSelector v-model="vari" :options="['{name}', '{age}']" placeholder="变量" />
        <DropdownSelector v-model="oper" :options="['是 zero', '是 one', '是 two', '是 few', '是 many', '是 other']"
            placeholder="复数条件" />
        <span>时，使用</span>
        <el-input v-model="tr" style="flex: 1;" size="small" placeholder="翻译"></el-input>
        <el-button size="small" :icon="Delete" circle title="删除" />
        <el-button size="small" style="margin-left: 0px;cursor: move;" :icon="Rank" circle title="排序" />
    </div>
</template>

<script lang="ts" setup>
import {
    ref
} from 'vue';

import {
    Delete,
    Rank
} from '@element-plus/icons-vue';

import DropdownSelector from './DropdownSelector.vue';

import {
    ElInput,
    ElButton
} from 'element-plus';

const vari = ref('');
const oper = ref('');
const tr = ref('');

</script>