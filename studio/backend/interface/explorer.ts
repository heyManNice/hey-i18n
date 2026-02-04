import project from '../services/project';
import config from '../services/config';

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