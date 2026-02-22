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

    // 保存翻译文件
    public saveI18nFile(filename: string, content: Record<string, MessageValue>) {
        // 需要删除的键
        const needDeleteKeys: string[] = [];
        // 应该确保 content 中texts的长度比varIndexes的长度大1，否则可能会导致前端展示错误
        for (const key in content) {
            const item = content[key];
            const targetLen = (item.varIndexes?.length ?? 0) + 1;
            const diff = targetLen - item.texts.length;

            if (diff > 0) {
                // texts 不够，补空字符串
                item.texts.push(...Array(diff).fill(''));
            } else if (diff < 0) {
                // texts 太多，把多余的合并到最后一个片段
                const extra = item.texts.slice(targetLen).join('');
                item.texts = item.texts.slice(0, targetLen);
                item.texts[targetLen - 1] += extra;
            }

            // 如果没有变量，并且texts只有一个元素而且还是空字符串，说明内容被清空了，应该删除这个键
            if ((item.varIndexes?.length ?? 0) === 0 && item.texts.length === 1 && item.texts[0] === '') {
                needDeleteKeys.push(key);
            }
        }

        const fileContent = this.getI18nFile(filename);
        const newContent = {
            ...fileContent,
            ...content
        };

        // 删除被清空的键
        for (const key of needDeleteKeys) {
            delete newContent[key];
        }

        const filePath = path.join(this.assetsPath, filename);
        fs.writeFileSync(filePath, JSON.stringify(newContent, null, 2), 'utf-8');
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

    // 删除i18n文件
    public deleteI18nFile(filename: string) {
        const filePath = path.join(this.assetsPath, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            throw new Error(`File ${filename} does not exist.`);
        }
    }
}


export default new AssetsService();