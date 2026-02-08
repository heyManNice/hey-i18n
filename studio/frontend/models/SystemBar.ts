import {
    reactive
} from 'vue';

const mSystemBar = reactive({
    status: {
        // 状态
        mStatus: 'complete' as 'complete' | 'error' | 'progress',

        // 信息文字
        mMessage: '就绪',

        // 进度
        mProgress: 0,

        // 设置进度
        fSetProgress(progress: number, progressText: string) {
            this.mStatus = 'progress';
            this.mProgress = progress;
            this.mMessage = progressText;
        },

        // 设置就绪
        fSetComplete(text?: string) {
            this.mStatus = 'complete';
            if (text) {
                this.mMessage = text;
            }
        },

        // 设置错误
        fSetError(text: string) {
            this.mStatus = 'error';
            this.mMessage = text;
        }
    },

    lastScanTime: {
        mLastScanTime: "上次扫描时间: 2024-06-01 12:00",

        // 设置上次扫描时间
        fSetLastScanTime(timestamp: number) {
            const time = new Date(timestamp);
            const year = time.getFullYear();
            const month = String(time.getMonth() + 1).padStart(2, '0');
            const day = String(time.getDate()).padStart(2, '0');
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            this.mLastScanTime = `上次扫描时间: ${year}-${month}-${day} ${hours}:${minutes}`;
        }
    },

    version: {
        mVersion: 'v0.0.1',
    }
});

export default mSystemBar;