import path from 'path';
import fs from 'fs';
import project from './project';

import type { MessageValue } from '../../../src/hey-i18n/locales';

class AssetsInterface {
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
}


export default new AssetsInterface();