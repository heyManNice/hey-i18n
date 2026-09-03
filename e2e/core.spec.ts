import { expect, test, type Page } from '@playwright/test';

async function clickLocale(page: Page, locale: string) {
    await page.locator(`[data-locale="${locale}"]`).click();
    await page.waitForFunction((expected) => document.documentElement.lang === expected, locale);
}

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('默认源语言直接渲染原文', async ({ page }) => {
    await expect(page.locator('#greeting')).toHaveText('Hello, Codex!');
    await expect(page.locator('#message')).toHaveText('Items: 3, total 42');
    await expect(page.locator('#current-locale')).toHaveText('en-US');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    await expect(page.locator('html')).not.toHaveAttribute('dir', 'rtl');
});

test('切换到中文语言包后展示译文并支持变量重排', async ({ page }) => {
    await clickLocale(page, 'zh-CN');
    await expect(page.locator('#greeting')).toHaveText('你好，Codex！');
    await expect(page.locator('#message')).toHaveText('共42 项，其中 3。');
    await expect(page.locator('#current-locale')).toHaveText('zh-CN');
});

test('阿拉伯语自动设置 RTL 方向', async ({ page }) => {
    await clickLocale(page, 'ar-SA');
    await expect(page.locator('#greeting')).toContainText('مرحبًا يا');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveClass(/rtl/);
});

test('空语言包回退原文', async ({ page }) => {
    await clickLocale(page, 'de-DE');
    await expect(page.locator('#greeting')).toHaveText('Hello, Codex!');
    await expect(page.locator('#message')).toHaveText('Items: 3, total 42');
    await expect(page.locator('#current-locale')).toHaveText('de-DE');
});

test('俄语复数按数量选择分支', async ({ page }) => {
    await clickLocale(page, 'ru-RU');
    await expect(page.locator('#plural-1')).toHaveText('1 яблоко');
    await expect(page.locator('#plural-2')).toHaveText('2 яблока');
    await expect(page.locator('#plural-5')).toHaveText('5 яблок');
});

test('切回源语言后仍然渲染原文', async ({ page }) => {
    await clickLocale(page, 'zh-CN');
    await expect(page.locator('#greeting')).toHaveText('你好，Codex！');
    await clickLocale(page, 'en-US');
    await expect(page.locator('#greeting')).toHaveText('Hello, Codex!');
});
