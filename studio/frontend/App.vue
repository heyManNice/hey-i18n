<template>
    <el-container style="height: 100vh">
        <el-main style="padding: 0;">
            <el-splitter>
                <el-splitter-panel size="250px" :min="250" style="background-color: var(--sidebar-bg-color);">
                    <Explorer />
                </el-splitter-panel>
                <el-splitter-panel :min="200" style="background-color: var(--panel-bg-color);display: flex;">
                    <Editor />
                </el-splitter-panel>
            </el-splitter>
        </el-main>
        <el-footer style="padding: 0;height: 20px;">
            <SystemBar />
        </el-footer>
    </el-container>
</template>

<script setup lang="ts">
import {
    ElSplitter,
    ElSplitterPanel,
    ElContainer,
    ElMain,
    ElFooter
} from 'element-plus';

import SystemBar from './views/SystemBar.vue';
import Explorer from './views/Explorer.vue';
import Editor from './views/Editor.vue';
</script>

<style>
body,
html {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    user-select: none;
}

:root {
    /* 基础 */
    --bg-color: #ffffff;
    --border-color: #dcdcdc;
    --text-color: #1e1e1e;
    --muted-text-color: #6a6a6a;

    /* 面板 */
    --panel-bg-color: #f3f3f3;
    --sidebar-bg-color: #eaeaea;
    --statusbar-bg-color: #f5f5f5;

    /* 语法高亮 */
    --keyword-color: #0000ff;
    --string-color: #a31515;
    --number-color: #098658;
    --function-color: #795e26;
    --variable-color: #001080;
    --comment-color: #008000;

    /* 交互 */
    --selection-bg-color: #cce5ff;
    --hover-bg-color: #e0e0e0;
    --cursor-color: #000000;
    --scrollbar-color: #c1c1c1;
}

html.dark {
    /* 基础 */
    --bg-color: #1e1e1e;
    --border-color: #3a3a3a;
    --text-color: #d4d4d4;
    --muted-text-color: #808080;

    /* 面板 */
    --panel-bg-color: #252526;
    --sidebar-bg-color: #2d2d2d;
    --statusbar-bg-color: #007acc;

    /* 语法高亮 */
    --keyword-color: #569cd6;
    --string-color: #ce9178;
    --number-color: #b5cea8;
    --function-color: #dcdcaa;
    --variable-color: #9cdcfe;
    --comment-color: #6a9955;

    /* 交互 */
    --selection-bg-color: #264f78;
    --hover-bg-color: #333333;
    --cursor-color: #aeafad;
    --scrollbar-color: #5a5a5a;
}

/**element */
:root {
    --el-bg-color: var(--bg-color) !important;
    --el-border-color: var(--border-color) !important;
    --el-text-color-primary: var(--text-color) !important;
    --el-fill-color-blank: var(--panel-bg-color) !important;
}
</style>