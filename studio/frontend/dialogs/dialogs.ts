import {
    h
} from 'vue';
import DialogFramework from './dialogFrimework';

import Settings from './Settings.vue';
import Confirm from './Confirm.vue';

// 设置页面
export function settings() {
    const dialog = new DialogFramework(Settings);
    // 记录设置已经打开
    localStorage.setItem('settingsOpen', 'true');
    // 关闭时清除记录
    dialog.setOnCloseCallback(() => {
        localStorage.removeItem('settingsOpen');
    });

    dialog.open();
}
// 如果设置页面已经打开，则自动打开
if (localStorage.getItem('settingsOpen') === 'true') {
    setTimeout(() => {
        settings();
    }, 0);
}


// 确认提示页面
export function confirm(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
        const dialog = new DialogFramework(h(Confirm, {
            title,
            message,
            onCancel() {
                // 已在setOnCloseCallback中resolve(false)
                dialog.close();
            },
            onConfirm() {
                resolve(true);
                dialog.close();
            }
        }));
        dialog.setSize('400px', 'fit-content');
        dialog.setOnCloseCallback(() => {
            resolve(false);
        });
        dialog.open();
    });
}