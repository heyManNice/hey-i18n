import {
    ref
} from 'vue';

const mSystemBar = {
    status: {
        // 就绪
        m_isComplete: ref(true),
        // 就绪文字
        m_completeText: ref('就绪'),

        // 进度
        m_progress: ref(0),
        // 进度文字
        m_progressText: ref(''),

        // 设置进度
        setProgress(progress: number, progressText: string) {
            this.m_isComplete.value = false;
            this.m_progress.value = progress;
            this.m_progressText.value = progressText;
        },

        // 设置就绪
        setComplete(text?: string) {
            this.m_isComplete.value = true;
            if (text) {
                this.m_completeText.value = text;
            }
        }
    },

    version: {
        m_version: ref('v0.0.1'),
    }
};

export default mSystemBar;