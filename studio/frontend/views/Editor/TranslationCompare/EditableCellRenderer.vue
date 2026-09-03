<template>
    <div class="container">
        <!-- 第一行的输入框 -->
        <div
            :class="{
                'is-editing': isEditing,
            }"
            class="editable-cell-renderer"
            @click.stop
        >
            <div
                style="flex: 1"
                ref="editorRef"
                class="editor-content"
                @dragstart.prevent
                :contenteditable="true"
                spellcheck="false"
                @input="onInput"
                @keydown="onKeydown"
                @blur="onBlur"
            ></div>
            <el-button
                style="margin-left: 0px"
                :icon="MagicStick"
                :loading="cellAiLoading"
                circle
                title="AI 翻译"
                @click="cellAiTranslate"
            />
            <el-dropdown trigger="click">
                <el-button style="margin-left: 0px" :icon="More" circle title="更多选项" />
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item
                            v-for="option in moreOptions"
                            :key="option.label"
                            :disabled="option.disabled"
                            @click="option.action"
                        >
                            {{ option.label }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <Teleport to="body">
                <ul v-if="showSuggestions" class="suggestions-list" :style="suggestionStyle">
                    <template v-if="filteredVariables.length > 0">
                        <li
                            v-for="(v, index) in filteredVariables"
                            :key="v"
                            :class="{ active: index === activeSuggestionIndex }"
                            @mousedown.prevent="insertVariable(v)"
                        >
                            <span class="variable">
                                {{ '{' + v + '}' }}
                            </span>
                        </li>
                    </template>
                    <li v-else class="no-suggestions">未匹配到变量</li>
                </ul>
            </Teleport>
            <PluralEditor
                v-if="pluralEditorOpen"
                :source-item="props.sourceItem"
                :item="props.item"
                :locale="props.filename.split('.')[0]"
                @cancel="pluralEditorOpen = false"
                @save="applyPluralData"
            />
            <FullEditor
                v-if="fullEditorOpen"
                :item="currentFullItem"
                :source-item="props.sourceItem"
                @cancel="fullEditorOpen = false"
                @save="applyFullTemplate"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';

import { mergeTextAndVariables } from '../../../utils/text-utils';

import { More, MagicStick } from '@element-plus/icons-vue';
import { ElButton } from 'element-plus';
import mEditor from '../../../models/Editor';
import { Notify } from '../../../models/SystemBar';
import type { TranslationItem } from '../../../models/Editor';

import { useDebounceFn } from '@vueuse/core';

import PluralEditor from './EditableCellRenderer/PluralEditor.vue';
import FullEditor from './EditableCellRenderer/FullEditor.vue';
import type { PluralCategoryData } from '../../../models/Editor';
import { templateToBranch } from '../../../utils/text-utils';

const props = defineProps<{
    item: TranslationItem;
    sourceItem: TranslationItem;
    filename: string;
}>();

const isEditing = computed(() => {
    const existingChange = mEditor.mChangeData[props.filename]?.[props.sourceItem.key];
    return !!existingChange;
});

const editorRef = ref<HTMLDivElement | null>(null);
const showSuggestions = ref(false);
const suggestionStyle = ref({ top: '0px', left: '0px' });
const activeSuggestionIndex = ref(0);
const pluralEditorOpen = ref(false);
const fullEditorOpen = ref(false);
const cellAiLoading = ref(false);

// 全屏编辑器展示的数据：优先取修改集，其次取语言包加载的条目
const currentFullItem = computed(() => {
    return mEditor.mChangeData[props.filename]?.[props.sourceItem.key] || props.item;
});

const filterQuery = ref('');
const filteredVariables = computed(() => {
    if (!filterQuery.value) return props.sourceItem.variables;
    return props.sourceItem.variables.filter((v) => v.toLowerCase().startsWith(filterQuery.value.toLowerCase()));
});

// 更多按钮选项
type MoreOption = {
    label: string;
    action: () => void;
    disabled?: boolean;
};

const moreOptions: MoreOption[] = [
    {
        label: '清空内容',
        action: () => {
            clearContent();
        },
    },
    {
        label: '放弃更改',
        action: () => {
            if (isEditing.value) {
                deleteChange();
                renderContent();
            }
        },
    },
    {
        label: '复数模式',
        action: () => {
            pluralEditorOpen.value = true;
        },
    },
    {
        label: '全屏编辑',
        action: () => {
            fullEditorOpen.value = true;
        },
    },
];

function renderContent() {
    if (!editorRef.value) return;
    // 诸如筛选时候
    // 该组件卸载并重新挂载时，查看内存里是否有修改的数据
    const existingChange = mEditor.mChangeData[props.filename]?.[props.sourceItem.key];
    const item = existingChange || props.item;
    const parts = mergeTextAndVariables(item.texts, item.variables);
    editorRef.value.innerHTML = '';
    parts.forEach((part) => {
        if (part.type === 'variable') {
            const span = createVariableElement(part.content);
            editorRef.value!.appendChild(span);
        } else {
            editorRef.value!.appendChild(document.createTextNode(part.content));
        }
    });
}

function createVariableElement(text: string) {
    const span = document.createElement('span');
    span.textContent = `{${text}}`;
    span.className = 'variable';
    span.contentEditable = 'false';
    return span;
}

onMounted(() => {
    renderContent();
});

function getEditorContent() {
    const content: typeof props.item = {
        key: props.sourceItem.key,
        texts: [],
        variables: [],
    };
    if (!editorRef.value) return content;

    editorRef.value.normalize(); // 合并文本节点，确保结构清晰
    editorRef.value.childNodes.forEach((node) => {
        if (node.textContent === null) return;
        if (node.nodeType === Node.TEXT_NODE) {
            // 普通的文字节点
            content.texts.push(node.textContent);
        } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('variable')) {
            // 变量节点
            if (content.texts.length === 0) {
                content.texts.push(''); // 确保变量前有文本占位
            }
            content.variables.push(node.textContent.slice(1, -1)); // 去除两端的花括号
        }
    });
    return content;
}

// 更新编辑状态，保存修改的内容
const debouncedUpdateEditingState = useDebounceFn(() => {
    const newContent = getEditorContent();

    if (
        newContent.texts.join('') !== props.item.texts.join('') ||
        newContent.variables.join(',') !== props.item.variables.join(',')
    ) {
        recordChange();
    } else {
        deleteChange();
    }
}, 300);

function onInput() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    debouncedUpdateEditingState();

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        // Check for '{' trigger or continuation
        const textUpToCursor = text.slice(0, offset);
        const lastBraceIndex = textUpToCursor.lastIndexOf('{');

        // Only trigger if '{' is recent and no '}' after it in the potential variable name
        if (lastBraceIndex !== -1) {
            const potentialVarAndFilter = textUpToCursor.slice(lastBraceIndex + 1);
            // Check if valid variable char (e.g. not contains '}' or whitespace)
            if (!/[}\s]/.test(potentialVarAndFilter)) {
                showSuggestions.value = true;
                filterQuery.value = potentialVarAndFilter;
                activeSuggestionIndex.value = 0;
                updateSuggestionPosition();
                return;
            }
        }
    }
    showSuggestions.value = false;
}

function updateSuggestionPosition() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let rect = range.getBoundingClientRect();

        if (rect.width === 0 && rect.height === 0) {
            const rects = range.getClientRects();
            if (rects.length > 0) rect = rects[0];
        }

        // Use fixed positioning
        suggestionStyle.value = {
            top: `${rect.bottom + 7}px`,
            left: `${rect.left}px`,
        };
    }
}

// 记录当前组件修改的数据
function recordChange() {
    const newContent = getEditorContent();
    const filename = props.filename;
    const key = props.sourceItem.key;
    if (!mEditor.mChangeData[filename]) {
        mEditor.mChangeData[filename] = {};
    }

    // 更新变量索引
    const varIndexes: number[] = [];
    for (const variable of newContent.variables) {
        const index = props.sourceItem.variables.indexOf(variable);
        if (index !== -1) {
            varIndexes.push(index);
        }
    }
    newContent.varIndexes = varIndexes;

    // 保留复数元数据（编辑 other 分支时不应丢失复数配置）
    const existingChange = mEditor.mChangeData[filename]?.[key];
    const pluralSource = existingChange || props.item;
    if (pluralSource.isPlural !== undefined) {
        newContent.isPlural = pluralSource.isPlural;
    }
    if (pluralSource.pluralVarIndex !== undefined) {
        newContent.pluralVarIndex = pluralSource.pluralVarIndex;
    }
    if (pluralSource.pluralCategory) {
        newContent.pluralCategory = pluralSource.pluralCategory;
    }

    mEditor.mChangeData[filename][key] = newContent;
}

// 删除记录当前组件修改的数据
function deleteChange() {
    const filename = props.filename;
    const key = props.sourceItem.key;
    if (mEditor.mChangeData[filename]) {
        delete mEditor.mChangeData[filename][key];
        // 如果该文件没有任何修改了，就删除这个文件的修改记录
        if (Object.keys(mEditor.mChangeData[filename]).length === 0) {
            delete mEditor.mChangeData[filename];
        }
    }
}

// 清空译文内容；保存时后端会把空内容当作删除该键处理
function clearContent() {
    if (!editorRef.value) {
        return;
    }
    editorRef.value.innerHTML = '';
    const content = getEditorContent();
    const isSameAsOriginal =
        content.texts.join('') === props.item.texts.join('') &&
        content.variables.join(',') === props.item.variables.join(',');
    if (isSameAsOriginal) {
        deleteChange();
    } else {
        recordChange();
    }
}

// 复数编辑器保存：把复数规则合并进当前修改集（other 分支保留在单元格内容中）
function applyPluralData(data: { isPlural: boolean; pluralVarIndex?: number; pluralCategory?: PluralCategoryData }) {
    const filename = props.filename;
    const key = props.sourceItem.key;
    if (!mEditor.mChangeData[filename]) {
        mEditor.mChangeData[filename] = {};
    }

    let current = mEditor.mChangeData[filename][key];
    if (!current) {
        current = getEditorContent();
        current.key = key;
        // 单元格可能还没编辑过，从语言包加载的条目中取 other 分支作为基底
        if ((current.texts.join('') === '' || current.variables.length === 0) && props.item.texts?.length > 0) {
            current.texts = [...props.item.texts];
            current.variables = [...(props.item.variables || [])];
            current.varIndexes = props.item.varIndexes ? [...props.item.varIndexes] : [];
        }
        mEditor.mChangeData[filename][key] = current;
    }

    current.isPlural = data.isPlural;
    if (data.pluralVarIndex === undefined) {
        delete current.pluralVarIndex;
    } else {
        current.pluralVarIndex = data.pluralVarIndex;
    }
    if (!data.pluralCategory) {
        delete current.pluralCategory;
    } else {
        current.pluralCategory = data.pluralCategory;
    }

    pluralEditorOpen.value = false;
}

// 单条 AI 翻译：生成该 key 的译文草稿并渲染到单元格
async function cellAiTranslate() {
    if (cellAiLoading.value) {
        return;
    }
    cellAiLoading.value = true;
    try {
        await mEditor.fAiTranslateKey(props.filename, props.sourceItem.key);
        Notify.ok(`AI 已生成「${props.sourceItem.key}」的翻译草稿`);
        renderContent();
    } catch (error) {
        Notify.fail(`AI 翻译失败：${(error as Error).message}`);
    } finally {
        cellAiLoading.value = false;
    }
}

// 全屏编辑器保存：把 {name} 模板编码回 texts + varIndexes（保留复数元数据）
function applyFullTemplate(template: string) {
    try {
        const filename = props.filename;
        const key = props.sourceItem.key;
        const sourceVariables = props.sourceItem.variables || [];
        const branch = templateToBranch(template, sourceVariables);

        if (!mEditor.mChangeData[filename]) {
            mEditor.mChangeData[filename] = {};
        }
        const existing = mEditor.mChangeData[filename][key];
        const current =
            existing ||
            (mEditor.mChangeData[filename][key] = {
                key,
                texts: [],
                variables: [],
            });

        current.texts = branch.texts;
        current.varIndexes = branch.varIndexes;
        current.variables = branch.varIndexes.map((varIndex) => sourceVariables[varIndex]);

        // 保留复数元数据（全屏编辑只改 other 分支）
        const pluralSource = existing || props.item;
        if (pluralSource.isPlural !== undefined) {
            current.isPlural = pluralSource.isPlural;
        }
        if (pluralSource.pluralVarIndex !== undefined) {
            current.pluralVarIndex = pluralSource.pluralVarIndex;
        }
        if (pluralSource.pluralCategory) {
            current.pluralCategory = pluralSource.pluralCategory;
        }

        fullEditorOpen.value = false;
        renderContent();
    } catch (error) {
        Notify.fail(`保存全屏编辑失败：${(error as Error).message}`);
    }
}

function onBlur() {
    setTimeout(() => {
        showSuggestions.value = false;
    }, 200);
}

// 显示推荐的时候的键盘操作
function onKeydown(e: KeyboardEvent) {
    if (showSuggestions.value) {
        if (filteredVariables.value.length === 0 && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
            e.preventDefault();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % filteredVariables.value.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeSuggestionIndex.value =
                (activeSuggestionIndex.value - 1 + filteredVariables.value.length) % filteredVariables.value.length;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredVariables.value.length > 0) {
                insertVariable(filteredVariables.value[activeSuggestionIndex.value]);
            }
        } else if (e.key === 'Escape') {
            showSuggestions.value = false;
        }
    }
}

function insertVariable(variableName: string) {
    const selection = window.getSelection();
    if (!selection) return;

    // We assume cursor is at the end of filterQuery
    const range = selection.getRangeAt(0);
    const node = range.startContainer;

    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const offset = range.startOffset;
        const lastBrace = text.lastIndexOf('{', offset - 1);

        if (lastBrace !== -1) {
            range.setStart(node, lastBrace);
            range.setEnd(node, offset);
            range.deleteContents();

            const placeholder = createVariableElement(variableName);
            range.insertNode(placeholder);

            range.setStartAfter(placeholder);
            range.setEndAfter(placeholder);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    showSuggestions.value = false;
    debouncedUpdateEditingState();
}
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.editable-cell-renderer {
    position: relative;
    display: flex;
    gap: 10px;
}

.editable-cell-renderer.is-editing::before {
    content: '*';
    position: absolute;
    left: -12px;
    font-size: 1rem;
}

.editor-content {
    min-height: 32px;
    padding: 2px 11px;
    /* Match text cell padding mostly */
    border: 1px solid var(--border-color);
    border-radius: 5px;
    white-space: pre;
    overflow-x: auto;
    overflow-y: hidden;
    outline: none;
    line-height: 24px;
    /* Fit in 32px roughly */
    font-size: 14px;
    color: var(--text-color);
    background-color: var(--panel-bg-color);
}

/* Hide scrollbar */
.editor-content::-webkit-scrollbar {
    display: none;
}

.editor-content {
    -ms-overflow-style: none;
    scrollbar-width: none;
    transition: border-color 0.3s;
}

.editor-content:focus {
    border-color: var(--el-color-primary);
}

.suggestions-list {
    position: fixed;
    z-index: 9999;
    background: var(--panel-bg-color);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 0;
    margin: 0;
    list-style: none;
    max-height: 200px;
    overflow-y: auto;
    min-width: 150px;
}

.suggestions-list li {
    padding: 5px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-color);
}

.suggestions-list li:hover,
.suggestions-list li.active {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
}

.no-suggestions {
    padding: 8px 12px;
    font-size: 14px;
    color: var(--text-color-secondary, #909399);
    cursor: default;
}
</style>
