import path from "path";
import fs from "fs";

class ProjectManager {
    private workspacePath: string;
    private projectName: string;
    private i18nDir: string;
    private sourcesLocale: string;
    constructor() {
        this.workspacePath = process.cwd();
        this.projectName = this.workspacePath.split(path.sep).pop() || 'unknown';
        this.i18nDir = 'i18n';
        this.sourcesLocale = 'en-US';
    }
    public listProjectInfo() {
        return {
            projectName: this.projectName,
            i18nDir: this.i18nDir,
            sourcesLocale: this.sourcesLocale
        };
    }
    public listI18nFiles() {
        const i18nPath = path.join(this.workspacePath, this.i18nDir);
        if (!fs.existsSync(i18nPath)) {
            return [];
        }
        return fs.readdirSync(i18nPath).filter(file => file.endsWith('.json'));
    }
}

export default new ProjectManager();