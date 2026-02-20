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
                <div v-if="activeMenu === 'project'">
                    <el-form label-width="auto">
                        <el-form-item label="项目源语言" title="开发者在代码中编写的原始字符串语言">
                            <el-select model-value="zh-CN">
                            </el-select>
                        </el-form-item>
                        <el-form-item label="用户初始语言" title="用户首次进入时显示的语言，可设置为自动检测或固定语言">
                            <el-select model-value="自动">
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
                <div v-if="activeMenu === 'view'">
                    <el-form label-width="auto">
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
                        <el-form-item label="提示">
                            <span style="color: var(--muted-text-color);">你可以点击背景的灰白处关闭设置面板。</span>
                        </el-form-item>
                    </el-form>
                </div>
                <div v-if="activeMenu === 'ai'">
                    <el-form label-width="auto">
                        <el-form-item label="AI 翻译接口来源">
                            <el-select placeholder="选择翻译接口来源">
                                <el-option value="hey-i18n-ai">
                                    <span>hey-i18n 官方平台</span>
                                    <el-tag style="margin-left: 5px;" size="small">0 配置</el-tag>
                                    <el-tag style="margin-left: 5px;" size="small">付费</el-tag>
                                </el-option>
                                <el-option value="third-party">
                                    <span>第三方 API 平台</span>
                                    <el-tag style="margin-left: 5px;" size="small">自配置</el-tag>
                                    <el-tag style="margin-left: 5px;" size="small">性价比</el-tag>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="API 平台">
                            <el-select placeholder="选择第三方 API 平台">
                                <el-option label="火山引擎 Ark" value="ark"></el-option>
                                <el-option label="OpenAI" value="null"></el-option>
                                <el-option label="阿里云白炼" value="null"></el-option>
                                <el-option label="智普 AI" value="null"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="API Key">
                            <el-input placeholder="请输入平台提供的 API Key" />
                        </el-form-item>
                        <el-form-item label="模型标识">
                            <el-input placeholder="请输入对应平台的模型名称或 ID" />
                        </el-form-item>
                        <el-form-item label="测试">
                            <el-button>测试连接</el-button>
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
    Folder,
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
    ElButton,
    ElTag
} from 'element-plus';

// 设置的选项类别
type Menu = {
    index: string;
    label: string;
    icon: typeof Monitor;
};

const menus: Menu[] = [
    { index: 'view', label: '视图', icon: Monitor },
    { index: 'project', label: '项目', icon: Folder },
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