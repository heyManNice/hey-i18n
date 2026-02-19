<template>
    <div class="settings-dialog-content">
        <el-container style="height: 100%;">
            <el-aside width="110px">
                <el-menu :default-active="menus[0].index" @select="index => activeMenu = index">
                    <el-menu-item style="height: 50px;" v-for="menu in menus" :index="menu.index">
                        <el-icon>
                            <component :is="menu.icon"></component>
                        </el-icon>
                        <span>{{ menu.label }}</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main>
                <div v-if="activeMenu === 'basic'">
                    <el-form>
                        <el-form-item label="项目代码原文语言">
                            <el-select model-value="zh-CN">
                            </el-select>
                        </el-form-item>
                        <el-form-item label="项目用户初始语言">
                            <el-select model-value="自动">
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
                <div v-if="activeMenu === 'view'">
                    <el-form>
                        <el-form-item label="界面语言">
                            <div style="display: flex;gap: 10px;flex: 1;">
                                <el-select model-value="简体中文">
                                    <el-option label="简体中文" value="zh-CN"></el-option>
                                    <el-option label="English" value="en-US"></el-option>
                                </el-select>
                                <el-button>
                                    重载后生效
                                </el-button>
                            </div>
                        </el-form-item>
                    </el-form>
                </div>
                <div v-if="activeMenu === 'ai'">
                    <el-form>
                        <el-form-item label="AI设置项1">
                            <el-input />
                        </el-form-item>
                        <el-form-item label="AI设置项2">
                            <el-input type="textarea" />
                        </el-form-item>
                    </el-form>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import {
    ref
} from 'vue';
import {
    Setting,
    Monitor,
    Lollipop
} from '@element-plus/icons-vue';
import {
    ElForm,
    ElFormItem,
    ElInput,
    ElContainer,
    ElAside,
    ElMain,
    ElMenu,
    ElMenuItem,
    ElIcon,
    ElSelect,
    ElOption,
    ElButton
} from 'element-plus';

// 设置的选项类别
type Menu = {
    index: string;
    label: string;
    icon: typeof Setting;
};

const menus: Menu[] = [
    { index: 'basic', label: '基础', icon: Setting },
    { index: 'view', label: '视图', icon: Monitor },
    { index: 'ai', label: 'AI', icon: Lollipop }
] as const;

// 当前活动的选项类别
const activeMenu = ref(menus[0].index);
</script>

<style scoped>
.settings-dialog-content {
    height: 100%;
}

.el-menu {
    height: 100%;
}
</style>