import path from "path";

class ProjectManager {
    private workspacePath: string;
    private projectName: string;
    private i18nPath: string;
    private sourcesLocale: string;
    constructor() {
        this.workspacePath = process.cwd();
        this.projectName = this.workspacePath.split(path.sep).pop() || 'default-project';
        this.i18nPath = path.join(this.workspacePath, 'i18n');
        this.sourcesLocale = 'en-US';
    }
    public getProjectInfo() {
        return {
            projectName: this.projectName,
            i18nPath: this.i18nPath,
            sourcesLocale: this.sourcesLocale
        };
    }
}

export default new ProjectManager();