import path from "path";
import fs from "fs";

class ProjectService {
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
            projectPath: this.workspacePath,
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

    public addI18nFile(filename: string) {
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

    // 检测当前项目是否是 vite 项目
    public isViteProject() {
        const packageJsonPath = path.join(this.workspacePath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return false;
        }
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
        return 'vite' in dependencies;
    }
}

export default new ProjectService();