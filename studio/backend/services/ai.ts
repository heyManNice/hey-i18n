import fs from 'fs';
import path from 'path';
import project from './project';
import assets from './assets';
import scaner from './scaner';
import { buildSourceTemplate, encodeTemplate } from '../utils/template';

export type AiPlatform = 'openai' | 'volcanoark' | 'model-studio' | 'zai';

export type AiConfig = {
    provider: 'hey-i18n-ai' | 'third-party';
    platform: AiPlatform;
    apiKey: string;
    model: string;
};

const PLATFORM_BASE_URLS: Record<AiPlatform, string> = {
    openai: 'https://api.openai.com/v1',
    volcanoark: 'https://ark.cn-beijing.volces.com/api/v3',
    'model-studio': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    zai: 'https://open.bigmodel.cn/api/paas/v4',
};

const DEFAULT_CONFIG: AiConfig = {
    provider: 'hey-i18n-ai',
    platform: 'openai',
    apiKey: '',
    model: '',
};

class AiService {
    private configFilePath = path.join(project.getWorkspacePath(), project.getI18nDir(), '.hey-i18n-ai-config');

    public getAiConfig(): AiConfig {
        if (!fs.existsSync(this.configFilePath)) {
            return { ...DEFAULT_CONFIG };
        }
        try {
            return {
                ...DEFAULT_CONFIG,
                ...(JSON.parse(fs.readFileSync(this.configFilePath, 'utf-8')) as Partial<AiConfig>),
            };
        } catch {
            return { ...DEFAULT_CONFIG };
        }
    }

    public setAiConfig(config: AiConfig) {
        const current = this.getAiConfig();
        const merged: AiConfig = {
            ...current,
            ...config,
            // API Key 留空表示沿用旧值，避免前端把未填写的输入框覆盖为空白
            apiKey: config.apiKey || current.apiKey,
        };
        fs.mkdirSync(path.dirname(this.configFilePath), { recursive: true });
        fs.writeFileSync(this.configFilePath, JSON.stringify(merged, null, 4), { encoding: 'utf-8', mode: 0o600 });
        fs.chmodSync(this.configFilePath, 0o600);
        return { saved: true };
    }

    public assertConfigUsable(config: AiConfig) {
        if (config.provider !== 'third-party') {
            throw new Error('hey-i18n 官方 AI 平台尚未开放，请先在设置中选择第三方 API 平台。');
        }
        if (!config.apiKey) {
            throw new Error('未配置 API Key，请先在设置中填写。');
        }
        if (!config.model) {
            throw new Error('未配置模型标识，请先在设置中填写。');
        }
    }

    private async chat(config: AiConfig, messages: { role: 'system' | 'user'; content: string }[]) {
        this.assertConfigUsable(config);
        // 测试环境可以通过环境变量覆盖 baseUrl
        const baseUrl = process.env.HEY_I18N_AI_BASE_URL || PLATFORM_BASE_URLS[config.platform];

        let response: Response;
        try {
            response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${config.apiKey}`,
                },
                body: JSON.stringify({
                    model: config.model,
                    messages,
                    temperature: 0.2,
                }),
            });
        } catch (error) {
            throw new Error(`无法连接 AI 服务：${(error as Error).message}`, { cause: error });
        }

        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            throw new Error(`AI 服务返回 ${response.status}：${detail.slice(0, 200)}`);
        }

        const data = (await response.json()) as {
            choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) {
            throw new Error('AI 服务没有返回翻译内容。');
        }
        return content;
    }

    public async testConnection() {
        const config = this.getAiConfig();
        const content = await this.chat(config, [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Reply with OK only.' },
        ]);
        return { ok: true, content: content.slice(0, 100) };
    }

    public async translateFile(filename: string) {
        const config = this.getAiConfig();
        const targetLocale = filename.replace(/\.json$/, '');
        const localAssets = assets.getI18nFile(filename);
        const cache = scaner.getI18nStringsFromCacheFile();
        const entries = cache.entries || [];
        const cacheKeys = new Set(entries.map((entry) => entry.texts.join('')));

        const untranslated = entries.filter((entry) => !localAssets[entry.texts.join('')]);
        if (untranslated.length === 0) {
            return { translated: [], untranslatedCount: 0, totalCount: cacheKeys.size };
        }

        const systemMessage = `You are a professional translator. Translate user text into ${targetLocale}.
Keep placeholders exactly as-is (e.g. {name}). Return only the translated text without quotes or explanations.`;

        const translated: {
            key: string;
            texts: string[];
            varIndexes: number[];
            variables: string[];
        }[] = [];
        for (const entry of untranslated) {
            const source = buildSourceTemplate(entry.texts, entry.variables || []);
            const content = await this.chat(config, [
                { role: 'system', content: systemMessage },
                { role: 'user', content: source },
            ]);
            const branch = encodeTemplate(content, entry.variables || []);
            translated.push({
                key: entry.texts.join(''),
                texts: branch.texts,
                varIndexes: branch.varIndexes,
                variables: entry.variables || [],
            });
        }

        return {
            translated,
            untranslatedCount: untranslated.length,
            totalCount: cacheKeys.size,
        };
    }
}

export default new AiService();
