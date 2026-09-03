<template>
    <Teleport to="body">
        <div class="plural-editor-backdrop" @click.self="emit('cancel')">
            <div class="plural-editor-panel" @click.stop>
                <h3>复数规则编辑</h3>
                <p class="hint">
                    默认（other）分支请直接在单元格中填写；下方为可选的复数条件分支，文本中用
                    <code>{变量名}</code>
                    插入变量。
                </p>
                <el-form label-position="left" label-width="110px">
                    <el-form-item label="启用复数">
                        <el-switch v-model="enabled" />
                    </el-form-item>
                    <template v-if="enabled">
                        <el-form-item label="复数变量">
                            <el-select v-model="variableName" placeholder="选择参与复数判断的变量" style="width: 100%">
                                <el-option
                                    v-for="variable in props.sourceItem.variables"
                                    :key="variable"
                                    :label="`{${variable}}`"
                                    :value="variable"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item v-if="activeCategories.length === 0" label="提示">
                            <span class="muted">
                                当前语言（{{ locale }}）没有除 other 外的复数类别，只需填写单元格中的默认译文即可。
                            </span>
                        </el-form-item>
                        <el-form-item v-for="category in activeCategories" :key="category" :label="`${category}`">
                            <el-input v-model="drafts[category]" placeholder="例如：{apples} 个苹果" clearable />
                        </el-form-item>
                    </template>
                    <el-form-item v-if="error" label="错误">
                        <span class="error">{{ error }}</span>
                    </el-form-item>
                </el-form>
                <div class="actions">
                    <el-button @click="emit('cancel')">取消</el-button>
                    <el-button type="primary" @click="save">保存</el-button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElButton, ElForm, ElFormItem, ElInput, ElOption, ElSelect, ElSwitch } from 'element-plus';

import type { PluralCategoryData, PluralCategoryKey, TranslationItem } from '../../../../models/Editor';
import { branchToTemplate, templateToBranch } from '../../../../utils/text-utils';

const CATEGORIES: PluralCategoryKey[] = ['zero', 'one', 'two', 'few', 'many'];

const props = defineProps<{
    sourceItem: TranslationItem;
    item: TranslationItem;
    locale: string;
}>();

const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'save', data: { isPlural: boolean; pluralVarIndex?: number; pluralCategory?: PluralCategoryData }): void;
}>();

// 该语言实际会使用的复数类别（other 由顶层字段承担）
const activeCategories = computed<PluralCategoryKey[]>(() => {
    try {
        const categories = new Intl.PluralRules(props.locale).resolvedOptions().pluralCategories as string[];
        return CATEGORIES.filter((category) => categories.includes(category));
    } catch {
        return [...CATEGORIES];
    }
});

const enabled = ref(!!props.item.isPlural);
const sourceVariables = props.sourceItem.variables || [];
const initialVariableIndex = props.item.pluralVarIndex;
const variableName = ref(sourceVariables[initialVariableIndex ?? -1] ?? sourceVariables[0] ?? '');

const drafts = reactive<Record<string, string>>({
    zero: '',
    one: '',
    two: '',
    few: '',
    many: '',
});

for (const category of CATEGORIES) {
    const branch = props.item.pluralCategory?.[category];
    if (branch) {
        drafts[category] = branchToTemplate(branch.texts, branch.varIndexes ?? [], sourceVariables);
    }
}

const error = ref('');

function save() {
    error.value = '';
    if (!enabled.value) {
        emit('save', { isPlural: false });
        return;
    }

    if (!variableName.value) {
        error.value = '请选择复数变量';
        return;
    }
    const variableIndex = sourceVariables.indexOf(variableName.value);
    if (variableIndex === -1) {
        error.value = `源码中不存在变量 {${variableName.value}}`;
        return;
    }

    const pluralCategory: PluralCategoryData = {};
    for (const category of activeCategories.value) {
        const template = drafts[category].trim();
        if (!template) {
            continue;
        }
        try {
            pluralCategory[category] = templateToBranch(template, sourceVariables);
        } catch (e) {
            error.value = `${(e as Error).message}（类别：${category}）`;
            return;
        }
    }

    emit('save', {
        isPlural: true,
        pluralVarIndex: variableIndex,
        pluralCategory,
    });
}
</script>

<style scoped>
.plural-editor-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background-color: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
}

.plural-editor-panel {
    width: min(560px, 92vw);
    max-height: 84vh;
    overflow: auto;
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
    padding: 1px 4px;
    border-radius: 3px;
}

.muted {
    color: var(--muted-text-color);
}

.error {
    color: #e64545;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
</style>
