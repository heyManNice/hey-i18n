import { expect, test } from '@playwright/test';
import { spawn, type ChildProcess } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoDir = path.join(repoRoot, 'demo');
const backendEntry = path.join(repoRoot, 'dist', 'hey-i18n-studio', 'backend', 'main.js');
const studioUrl = 'http://127.0.0.1:3034';

let server: ChildProcess;
let projectDir: string;

async function waitForServer(url: string, timeoutMs = 15_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return;
            }
        } catch {
            // 服务尚未就绪
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    throw new Error(`Server at ${url} did not become ready in time.`);
}

test.beforeAll(async () => {
    if (!fs.existsSync(backendEntry)) {
        throw new Error(`studio 后端产物不存在，请先执行 npm run build:studio`);
    }

    // 在临时目录复制一份 demo 作为被翻译的项目，避免测试改动污染仓库内数据
    projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hey-i18n-studio-e2e-'));
    for (const name of ['package.json', 'index.html', 'vite.config.ts']) {
        fs.copyFileSync(path.join(demoDir, name), path.join(projectDir, name));
    }
    for (const name of ['src', 'i18n']) {
        fs.cpSync(path.join(demoDir, name), path.join(projectDir, name), { recursive: true });
    }

    server = spawn('node', [backendEntry, '-p', '3034'], {
        cwd: projectDir,
        stdio: 'pipe',
    });
    await waitForServer(studioUrl);
});

test.afterAll(async () => {
    server?.kill();
});

test('studio 扫描项目原文并完成一次翻译保存', async ({ page }) => {
    await page.goto(studioUrl);
    await expect(page.getByText('hey-i18n-studio').first()).toBeVisible();

    // 扫描项目原文，生成 key 缓存
    await page.getByRole('button', { name: '扫描项目原文' }).click();
    await expect(page.getByText('扫描项目原文完成')).toBeVisible({ timeout: 15_000 });

    // 打开 zh-CN.json 语言文件
    const fileNode = page.locator('.el-tree-node__content').filter({ hasText: 'zh-CN.json' });
    await fileNode.first().click();
    await expect(page.getByText('总计: 4')).toBeVisible();

    // 找到目标行并编辑译文
    const row = page.locator('.el-table__row').filter({ hasText: 'This sentence will stay English.' });
    const editor = row.locator('.editor-content');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('这句话会保持英文（e2e 修改）。');

    // 等待防抖写入修改集，保存按钮可用后点击
    const saveButton = page.getByRole('button', { name: '保存' });
    await expect(saveButton).toBeEnabled({ timeout: 5_000 });
    await saveButton.click();
    await expect(page.getByText(/更新 zh-CN\.json 的 1 条翻译成功/)).toBeVisible({ timeout: 10_000 });

    // 校验语言文件确实被后端写入
    const zhFile = JSON.parse(fs.readFileSync(path.join(projectDir!, 'i18n', 'zh-CN.json'), 'utf-8'));
    expect(zhFile['This sentence will stay English.']).toEqual({
        texts: ['这句话会保持英文（e2e 修改）。'],
        varIndexes: [],
    });
});

test('studio 编辑复数规则并保存', async ({ page }) => {
    await page.goto(studioUrl);
    await expect(page.getByText('hey-i18n-studio').first()).toBeVisible();

    // 打开 ru-RU.json（demo 里已包含一个复数词条）
    const fileNode = page.locator('.el-tree-node__content').filter({ hasText: 'ru-RU.json' });
    await fileNode.first().click();
    await expect(page.getByText('总计: 4')).toBeVisible();

    // 定位复数词条所在行，打开“复数模式”
    const row = page.locator('.el-table__row').filter({ hasText: 'apples' });
    await row.locator('button[title="更多选项"]').click();
    await page.getByRole('menuitem', { name: '复数模式' }).click();

    // 修改 many 分支
    const panel = page.locator('.plural-editor-panel');
    await expect(panel).toBeVisible();
    const manyFormItem = panel.locator('.el-form-item').filter({ hasText: 'many' });
    await manyFormItem.locator('input').fill('{apples} яблок (e2e)');
    await panel.getByRole('button', { name: '保存' }).click();

    // 保存语言文件
    const saveButton = page.getByRole('button', { name: '保存' });
    await expect(saveButton).toBeEnabled({ timeout: 5_000 });
    await saveButton.click();
    await expect(page.getByText(/更新 ru-RU\.json 的 1 条翻译成功/)).toBeVisible({ timeout: 10_000 });

    const ruFile = JSON.parse(fs.readFileSync(path.join(projectDir!, 'i18n', 'ru-RU.json'), 'utf-8'));
    expect(ruFile[' apples'].pluralCategory.many).toEqual({
        texts: ['', ' яблок (e2e)'],
        varIndexes: [0],
    });
});
