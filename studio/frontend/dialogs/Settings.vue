<template>
    <div class="settings-dialog-content">
        <el-container style="height: 100%;">
            <el-aside width="110px">
                <el-menu :default-active="String(activeMenuIndex)" @select="i => activeMenuIndex = Number(i)">
                    <el-menu-item style="height: 50px;" v-for="(menu, i) in menus" :index="String(i)">
                        <el-icon>
                            <component :is="menu.icon"></component>
                        </el-icon>
                        <span>{{ menu.label }}</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main>
                <component :is="menus[activeMenuIndex].component"></component>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import {
    useStorage
} from '@vueuse/core';
import {
    Folder,
    Monitor,
    Lollipop
} from '@element-plus/icons-vue';
import {
    ElContainer,
    ElAside,
    ElMain,
    ElMenu,
    ElMenuItem,
    ElIcon,
} from 'element-plus';

import Project from './Settings/Project.vue';
import View from './Settings/View.vue';
import Ai from './Settings/Ai.vue';

// 设置的选项类别
type Menu = {
    label: string;
    icon: typeof Monitor;
    component: typeof View;
};

const menus: Menu[] = [
    { label: '视图', icon: Monitor, component: View },
    { label: '项目', icon: Folder, component: Project },
    { label: 'AI', icon: Lollipop, component: Ai }
] as const;

// 当前活动的选项索引
const activeMenuIndex = useStorage('settings:activeMenuIndex', 0);

</script>

<style scoped>
.settings-dialog-content {
    height: 100%;
}

.el-menu {
    height: 100%;
}
</style>