import path from 'path';
import fs from 'fs';
import project from './project';
import scaner from './scaner';

import type { MessageValue } from '../../../src/hey-i18n/locales';

class AssetsService {
    private assetsPath: string;
    constructor() {
        this.assetsPath = path.join(project.getWorkspacePath(), project.getI18nDir());
    }

    public getI18nFile(filename: string) {
        const filePath = path.join(this.assetsPath, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${filename} does not exist.`);
        }
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent) as Record<string, MessageValue>;
    }

    // 获取原文键长度和文件已编辑的键长度
    public getI18nKeysStats(files: string[]) {
        const result: {
            [filename: string]: {
                totalKeys: number;
                currentKeys: number;
            }
        } = {};
        const entries = scaner.getI18nStringsFromCacheFile().entries || [];
        const totalKeys = entries.length;

        for (const file of files) {
            const fileContent = this.getI18nFile(file);
            const currentKeys = Object.keys(fileContent).length;
            result[file] = {
                totalKeys,
                currentKeys,
            };
        }
        return result;
    }
}


export default new AssetsService();