import path from 'path';
import fs from 'fs';
import project from './project';
import scaner from './scaner';
import { assertLocaleFile } from '../utils/locale-file';

import type { MessageValue } from '../../../src/hey-i18n/locales';

class AssetsService {
    private assetsPath: string;
    constructor() {
        this.assetsPath = path.join(project.getWorkspacePath(), project.getI18nDir());
    }

    private getFilePath(filename: string) {
        assertLocaleFile(filename);
        return path.join(this.assetsPath, filename);
    }

    public getI18nFile(filename: string) {
        const filePath = this.getFilePath(filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${filename} does not exist.`);
        }
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent) as Record<string, MessageValue>;
    }

    // 确保一个分支的 texts 长度比 varIndexes 大 1，避免前端展示/运行时拼接错位
    private normalizeMessageBranch(item: { texts: string[]; varIndexes?: number[] }) {
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
    }

    // 保存翻译文件
    public saveI18nFile(filename: string, content: Record<string, MessageValue>) {
        const filePath = this.getFilePath(filename);
        // 需要删除的键
        const needDeleteKeys: string[] = [];
        for (const key in content) {
            const item = content[key];
            this.normalizeMessageBranch(item);

            // 复数条目：条件分支也各自归一化；other（顶层）为空不代表要删除
            if (item.isPlural && item.pluralCategory) {
                for (const branch of Object.values(item.pluralCategory)) {
                    if (branch) {
                        this.normalizeMessageBranch(branch);
                    }
                }
            }

            // 如果没有变量，并且texts只有一个元素而且还是空字符串，说明内容被清空了，应该删除这个键
            if (
                !item.isPlural &&
                (item.varIndexes?.length ?? 0) === 0 &&
                item.texts.length === 1 &&
                item.texts[0] === ''
            ) {
                needDeleteKeys.push(key);
            }
        }

        const fileContent = this.getI18nFile(filename);
        const newContent = {
            ...fileContent,
            ...content,
        };

        // 删除被清空的键
        for (const key of needDeleteKeys) {
            delete newContent[key];
        }

        fs.writeFileSync(filePath, JSON.stringify(newContent, null, 2), 'utf-8');
    }

    // 获取原文键长度和文件已编辑的键长度
    public getI18nKeysStats(files: string[]) {
        const result: {
            [filename: string]: {
                totalKeys: number;
                currentKeys: number;
                invalidKeys: number;
            };
        } = {};
        const entries = scaner.getI18nStringsFromCacheFile().entries || [];
        const cacheKeys = new Set(entries.map((entry) => entry.texts.join('')));
        const totalKeys = cacheKeys.size;

        for (const file of files) {
            const fileContent = this.getI18nFile(file);
            const keys = Object.keys(fileContent);
            const currentKeys = keys.filter((key) => cacheKeys.has(key)).length;
            result[file] = {
                totalKeys,
                currentKeys,
                invalidKeys: keys.length - currentKeys,
            };
        }
        return result;
    }

    // 清理语言包中已不在源码缓存里的键
    public cleanupInvalidKeys(filename: string) {
        const filePath = this.getFilePath(filename);
        const fileContent = this.getI18nFile(filename);
        const entries = scaner.getI18nStringsFromCacheFile().entries || [];
        const cacheKeys = new Set(entries.map((entry) => entry.texts.join('')));
        const removedKeys = Object.keys(fileContent).filter((key) => !cacheKeys.has(key));

        if (removedKeys.length > 0) {
            for (const key of removedKeys) {
                delete fileContent[key];
            }
            fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');
        }
        return { removedKeys };
    }

    // 删除i18n文件
    public deleteI18nFile(filename: string) {
        const filePath = this.getFilePath(filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            throw new Error(`File ${filename} does not exist.`);
        }
    }
}

export default new AssetsService();
