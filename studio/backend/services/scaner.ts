import path from "path";
import fs from "fs";
import project from "./project";

function iterateSourceFiles(
    dirPath: string,
    fileCallback: (filePath: string) => void,
    extensions: string[]
) {
    if (!fs.existsSync(dirPath)) {
        return;
    }
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            iterateSourceFiles(fullPath, fileCallback, extensions);
        } else if (extensions.includes(path.extname(entry.name))) {
            fileCallback(fullPath);
        }
    }
}

// 匹配文件中 T``形势的字符串，并给出行数列数、文本原内容
function matchI18nStringsInFile(filePath: string) {
    const results = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const macth = content.matchAll(/T`([^`]+)`/g);
    for (const match of macth) {
        const index = match.index || 0;
        const beforeContent = content.slice(0, index);
        const lineNumber = beforeContent.split('\n').length;
        const columnNumber = index - beforeContent.lastIndexOf('\n');
        const rawText = match[1];

        // 获取去除${...}后的文本数组
        const textParts = rawText.split(/\$\{[^}]+\}/g);

        // 获取${...}中的变量部分
        const variableParts = [];
        const varMatch = rawText.matchAll(/\$\{([^}]+)\}/g);
        for (const vMatch of varMatch) {
            variableParts.push(vMatch[1].trim());
        }

        results.push({
            file: path.relative(project.getWorkspacePath(), filePath).split(path.sep).join('/'),
            line: lineNumber,
            column: columnNumber,
            raw: rawText,
            texts: textParts.filter(part => part.length > 0),
            variables: variableParts
        });
    }
    return results;
}

class ScanerService {
    private cacheFilePath: string;
    constructor() {
        this.cacheFilePath = path.join(
            project.getWorkspacePath(),
            project.getI18nDir(),
            '.hey-i18n-key-cache'
        );
    }

    public scanI18nStrings(sourcePaths: string[]) {
        const results: ReturnType<typeof matchI18nStringsInFile> = [];
        for (const sourcePath of sourcePaths) {
            const fullPath = path.join(project.getWorkspacePath(), sourcePath);
            iterateSourceFiles(
                fullPath,
                (filePath) => {
                    const matches = matchI18nStringsInFile(filePath);
                    if (matches.length > 0) {
                        results.push(...matches);
                    }

                },
                ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte']
            );
        }
        console.log(results);
        return results;
    }

    public saveI18nStringsToCacheFile(scanResults: ReturnType<typeof this.scanI18nStrings>) {
        if (scanResults.length === 0) {
            throw new Error('No i18n strings found to save to cache file.');
        }
        const cacheData = {
            metadata: {
                timestamp: Date.now(),
                project: project.listProjectInfo()
            },
            entries: scanResults
        };
        fs.writeFileSync(this.cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf-8');
        return cacheData;
    }

    // 获取缓存文件中的内容
    public getI18nStringsFromCacheFile() {
        if (!fs.existsSync(this.cacheFilePath)) {
            throw new Error('Cache file does not exist.');
        }
        const cacheContent = fs.readFileSync(this.cacheFilePath, 'utf-8');
        return JSON.parse(cacheContent) as ReturnType<typeof this.saveI18nStringsToCacheFile>;
    }
}

export default new ScanerService();