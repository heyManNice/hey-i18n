import {
    ElMessageBox
} from 'element-plus';

import DialogFramework from './dialogFrimework';

import Settings from './Settings.vue';

// 确认提示框
export async function confirm(title: string, message: string) {
    try {
        await ElMessageBox.confirm(
            message,
            title,
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                lockScroll: false,
            }
        )
        return true;
    } catch {
        return false;
    }
}

// 设置页面
export const settings = new DialogFramework(Settings);