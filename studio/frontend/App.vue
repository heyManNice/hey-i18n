<template>
    <el-container style="height: 100vh">
        <el-main style="padding: 0;">
            <el-splitter>
                <el-splitter-panel size="250" :min="100">
                    <Explorer />
                </el-splitter-panel>
                <el-splitter-panel :min="200">
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