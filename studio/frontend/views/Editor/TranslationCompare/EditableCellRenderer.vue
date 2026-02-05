<template>
    <div class="editable-cell-renderer" @click.stop>
        <div style="flex: 1;" ref="editorRef" class="editor-content" :contenteditable="true" spellcheck="false"
            @input="onInput" @keydown="onKeydown" @blur="onBlur"></div>
        <el-button :icon="FullScreen" circle />
        <Teleport to="body">
            <ul v-if="showSuggestions" class="suggestions-list" :style="suggestionStyle">
                <template v-if="filteredVariables.length > 0">
                    <li v-for="(v, index) in filteredVariables" :key="v"
                        :class="{ active: index === activeSuggestionIndex }" @mousedown.prevent="insertVariable(v)">
                        <span class="placeholder">
                            {{ '{' + v + '}' }}
                        </span>
                    </li>
                </template>
                <li v-else class="no-suggestions">未匹配到变量</li>
            </ul>
        </Teleport>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { splitTextWithPlaceholders } from '../../../utils/textUtils';

import { FullScreen } from '@element-plus/icons-vue';
import { ElButton } from 'element-plus';

const props = defineProps<{
    modelValue: string;
    sourceText: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const editorRef = ref<HTMLDivElement | null>(null);
const showSuggestions = ref(false);
const suggestionStyle = ref({ top: '0px', left: '0px' });
const activeSuggestionIndex = ref(0);

// Extract variables from source text
const variables = computed(() => {
    const vars: string[] = [];
    const regex = /{([^}]+)}/g;
    let match;
    while ((match = regex.exec(props.sourceText)) !== null) {
        vars.push(match[1]);
    }
    return [...new Set(vars)];
});

const filterQuery = ref('');
const filteredVariables = computed(() => {
    if (!filterQuery.value) return variables.value;
    return variables.value.filter(v => v.toLowerCase().startsWith(filterQuery.value.toLowerCase()));
});

const renderContent = () => {
    if (!editorRef.value) return;
    const parts = splitTextWithPlaceholders(props.modelValue);
    editorRef.value.innerHTML = '';
    parts.forEach(part => {
        if (part.type === 'placeholder') {
            const span = createPlaceholderElement(part.content);
            editorRef.value!.appendChild(span);
        } else {
            editorRef.value!.appendChild(document.createTextNode(part.content));
        }
    });
};

const createPlaceholderElement = (text: string) => {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'placeholder';
    span.contentEditable = 'false';
    return span;
};

onMounted(() => {
    renderContent();
});

watch(() => props.modelValue, (newVal) => {
    if (editorRef.value && getEditorContent() !== newVal) {
        renderContent();
    }
});

const getEditorContent = () => {
    if (!editorRef.value) return '';
    let text = '';
    editorRef.value.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('placeholder')) {
            text += node.textContent;
        } else if (node.nodeName === 'BR') {
            // text += '\n'; // Handle newlines if needed, but for now single line mostly
        }
    });
    return text;
};

const onInput = (e: Event) => {
    emit('update:modelValue', getEditorContent());

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

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
};

const updateSuggestionPosition = () => {
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
};

const onBlur = () => {
    setTimeout(() => {
        showSuggestions.value = false;
    }, 200);
};

const onKeydown = (e: KeyboardEvent) => {
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
            activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + filteredVariables.value.length) % filteredVariables.value.length;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredVariables.value.length > 0) {
                insertVariable(filteredVariables.value[activeSuggestionIndex.value]);
            }
        } else if (e.key === 'Escape') {
            showSuggestions.value = false;
        }
    }
};

const insertVariable = (variableName: string) => {
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

            const placeholder = createPlaceholderElement(`{${variableName}}`);
            range.insertNode(placeholder);

            range.setStartAfter(placeholder);
            range.setEndAfter(placeholder);

            // Insert ZWSP usually helps, but nbsp (\u00A0) is visible. 
            // \u200B is zero width space, might be tricky for deletion.
            // Let's use \u00A0 (nbsp) for safety or nothing if browser handles it.
            // Chrome handles cursor after contentEditable=false block okay usually if there is text node.
            // Inserting an empty text node might needed.
            const spacer = document.createTextNode('\u200B');
            range.insertNode(spacer);
            range.setStartAfter(spacer);
            range.setEndAfter(spacer);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    showSuggestions.value = false;
    emit('update:modelValue', getEditorContent());
};

</script>

<style scoped>
.editable-cell-renderer {
    position: relative;
    width: calc(var(--col-width) - 10px);
    display: flex;
    gap: 10px;
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

:deep(.placeholder) {
    background-color: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    border-radius: 4px;
    padding: 2px 5px;
    margin: 0 2px;
    font-weight: bold;
    display: inline;
    line-height: 1.2;
    cursor: default;
    user-select: all;
    -webkit-user-select: all;
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
