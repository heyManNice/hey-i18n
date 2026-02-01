import path from "path";
import fs from "fs";

class ProjectInterface {
    private workspacePath: string;
    private projectName: string;
    private i18nDir: string;
    constructor() {
        this.workspacePath = process.cwd();
        this.projectName = this.workspacePath.split(path.sep).pop() || 'unknown';
        this.i18nDir = 'i18n';
    }
    public listProjectInfo() {
        return {
            projectName: this.projectName,
            i18nDir: this.i18nDir,
        };
    }
    public listI18nFiles() {
        const i18nPath = path.join(this.workspacePath, this.i18nDir);
        if (!fs.existsSync(i18nPath)) {
            return [];
        }
        return fs.readdirSync(i18nPath).filter(file => file.endsWith('.json'));
    }

    public addI18nFile(filename: `${string}.json`) {
        const filePath = path.join(this.workspacePath, this.i18nDir, filename);
        if (fs.existsSync(filePath)) {
            throw new Error(`File ${filename} already exists.`);
        }
        fs.writeFileSync(filePath, '{}', 'utf-8');
    }

    public getWorkspacePath() {
        return this.workspacePath;
    }

    public getI18nDir() {
        return this.i18nDir;
    }
}

export default new ProjectInterface();