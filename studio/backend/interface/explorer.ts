import project from '../services/project';
import config from '../services/config';
import assets from '../services/assets';

export async function getTreeData() {
    return {
        info: project.listProjectInfo(),
        files: project.listI18nFiles(),
        config: await config.getConfig(),
    }
}

export function addI18nFile(locale: string) {
    return project.addI18nFile(locale);
}

// 获取原文键长度和文件已编辑的键长度
export function getI18nKeysStats(files: string[]) {
    return assets.getI18nKeysStats(files);
}