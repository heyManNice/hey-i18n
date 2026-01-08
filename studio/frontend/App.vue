<template>
    <el-splitter>
        <el-splitter-panel size="250" :min="100">
            <div class="demo-panel">1</div>
        </el-splitter-panel>
        <el-splitter-panel :min="200">
            <div class="demo-panel">2</div>
        </el-splitter-panel>
    </el-splitter>
</template>

<script setup lang="ts">
import { ElSplitter, ElSplitterPanel } from 'element-plus';
</script>