<template>
    <Teleport to="body">
        <div class="full-editor-backdrop" @click.self="emit('cancel')">
            <div class="full-editor-panel" @click.stop>
                <h3>全屏编辑</h3>
                <p class="hint">
                    使用 <code>{变量名}</code> 插入源码变量。可用变量：
                    <code v-for="variable in props.sourceItem.variables" :key="variable" class="variable-tag">
                        { {{ variable }} }
                    </code>
                    <span v-if="props.sourceItem.variables.length === 0">（无）</span>
                </p>
                <el-input
                    v-model="draft"
                    :autosize="{ minRows: 6, maxRows: 18 }"
                    placeholder="输入译文，例如：你好，{name}！"
                    type="textarea"
                />
                <p v-if="error" class="error">{{ error }}</p>
                <div class="actions">
                    <el-button @click="emit('cancel')">取消</el-button>
                    <el-button type="primary" @click="save">保存</el-button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElInput } from 'element-plus';

import type { TranslationItem } from '../../../../models/Editor';
import { branchToTemplate, templateToBranch } from '../../../../utils/text-utils';

const props = defineProps<{
    item: TranslationItem;
    sourceItem: TranslationItem;
}>();

const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'save', template: string): void;
}>();

const draft = ref(
    branchToTemplate(props.item.texts || [], props.item.varIndexes || [], props.sourceItem.variables || []),
);
const error = ref('');

function save() {
    error.value = '';
    try {
        templateToBranch(draft.value, props.sourceItem.variables || []);
        emit('save', draft.value.trim());
    } catch (e) {
        error.value = (e as Error).message;
    }
}
</script>

<style scoped>
.full-editor-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1300;
    background-color: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
}

.full-editor-panel {
    width: min(680px, 92vw);
    background: var(--bg-color);
    color: var(--text-color);
    border-radius: 6px;
    padding: 18px 22px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

h3 {
    margin: 0 0 8px;
}

.hint {
    color: var(--muted-text-color);
    font-size: 12px;
    margin: 0 0 12px;
}

.hint code {
    background: var(--panel-bg-color);
    padding: 1px 5px;
    border-radius: 3px;
    margin-right: 4px;
}

.error {
    color: #e64545;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
}
</style>
