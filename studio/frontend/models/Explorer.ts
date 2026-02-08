import {
    reactive,
    computed
} from 'vue';

import { languages } from '../consts/languages';

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
    }

});

export default mExplorer;

export function useExplorerData() {
    return useReactivePromise(async function () {
        const { info, files, config } = await backend.explorer.getTreeData();
        const treeData = [{
            label: `${info.projectName}/${info.i18nDir} (原文 ${config.sourcesLocale})`,
            children: Array.from(files).map(file => ({ label: file })),
        }];
        return {
            treeData
        };
    });
}