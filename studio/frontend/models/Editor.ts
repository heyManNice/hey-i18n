import {
    reactive
} from 'vue';

const mEditor = reactive({
    mTabs: [] as {
        filename: string;
    }[],
    mActiveTab: '',

    // 添加标签页
    fAddTab(filename: string) {
        const existingTab = this.mTabs.find(tab => tab.filename === filename);
        if (existingTab) {
            this.mActiveTab = existingTab.filename;
            return;
        }
        this.mTabs.push({
            filename: filename
        });
        this.mActiveTab = filename;
    },

    // 删除标签页
    fRemoveTab(filename: string) {
        const index = this.mTabs.findIndex(tab => tab.filename === filename);
        if (index !== -1) {
            this.mTabs.splice(index, 1);
            // 如果删除的是当前标签，切换到第一个标签
            if (this.mActiveTab === filename) {
                this.mActiveTab = this.mTabs.length > 0 ? this.mTabs[0].filename : '';
            }
        }
    }
});

export default mEditor;