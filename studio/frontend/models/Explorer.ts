import {
    reactive,
    computed,
    ref
} from 'vue';

import { languages } from '../consts/languages';

import mSystemBar from './SystemBar';

import {
    useReactivePromise
} from '../utils/promise';
import backend from '../rpc/backend';

const mExplorer = reactive({
    // 资源树搜索数据
    mTreeSearch: '',

    // 添加语言输入框
    mAddLangInput: '',

    // 添加语言输入框的建议列表函数
    fFetchLangSug(input: string, callback: any) {
        const suggestions = languages.filter(lang => lang.indexOf(input) !== -1).map(lang => ({ value: lang }));
        callback(suggestions);
    },

    // 项目原文
    mSourceLocale: 'null',

    // 项目路径，默认使用 空字符串
    mProjectPath: '',

    // i18n文件名列表
    mI18nFiles: [] as string[],

    // 更新文件列表函数
    fUpdateFiles: () => { }
});

export default mExplorer;

export function useExplorerData() {
    return useReactivePromise(async function () {
        const { info, files, config } = await backend.explorer.getTreeData();

        // 信息同步到模型
        mExplorer.mSourceLocale = config.sourcesLocale;
        mExplorer.mProjectPath = info.projectPath;
        mExplorer.mI18nFiles = files;

        const keysStats = ref<Awaited<ReturnType<typeof backend.explorer.getI18nKeysStats>>>({});

        // 获取原文键长度和文件已编辑的键长度
        backend.explorer.getI18nKeysStats(files).then(stats => {
            keysStats.value = stats;
        });

        // 更新上次扫描时间戳
        backend.explorer.getScanKeysTimestamp().then(timestamp => {
            mSystemBar.cScanTime.fSetLastScanTime(timestamp);
        });

        const treeData = [{
            isDir: true,
            label: `${info.projectName}/${info.i18nDir} (原文 ${config.sourcesLocale})`,
            children: computed(() => {
                return Array.from(files)
                    .map(file => ({
                        label: file,
                        totalKeys: keysStats.value[file]?.totalKeys || 0,
                        currentKeys: keysStats.value[file]?.currentKeys || 0,
                    }))
                    .filter(file => file.label.indexOf(mExplorer.mTreeSearch) !== -1);
            })
        }];
        return {
            treeData
        };
    });
}