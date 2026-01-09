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

    lastScanTime: {
        m_lastScanTime: ref("上次扫描时间: 2024-06-01 12:00"),
        setLastScanTime(timestamp: number) {
            const time = new Date(timestamp);
            const year = time.getFullYear();
            const month = String(time.getMonth() + 1).padStart(2, '0');
            const day = String(time.getDate()).padStart(2, '0');
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            this.m_lastScanTime.value = `上次扫描时间: ${year}-${month}-${day} ${hours}:${minutes}`;
        }
    },

    version: {
        m_version: ref('v0.0.1'),
    }
};

export default mSystemBar;