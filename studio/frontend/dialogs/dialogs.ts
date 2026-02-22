import {
    h
} from 'vue';
import DialogFramework from './dialogFrimework';

import Settings from './Settings.vue';
import Confirm from './Confirm.vue';

// 设置页面
export const settings = new DialogFramework(Settings);


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