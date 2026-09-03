import ai from '../services/ai';
import type { AiConfig } from '../services/ai';

// 读取 AI 配置（不会返回 API Key 明文，只给是否已配置）
export function getAiConfig() {
    const config = ai.getAiConfig();
    return {
        ...config,
        apiKey: config.apiKey ? '******' : '',
        hasApiKey: !!config.apiKey,
    };
}

// 保存 AI 配置；apiKey 留空表示保留旧值
export function setAiConfig(config: Partial<AiConfig>) {
    return ai.setAiConfig({
        provider: config.provider ?? 'hey-i18n-ai',
        platform: config.platform ?? 'openai',
        apiKey: config.apiKey ?? '',
        model: config.model ?? '',
    });
}

// 测试连接
export function testConnection() {
    return ai.testConnection();
}

// 批量翻译当前语言文件中未翻译的条目
export function translateFile(filename: string) {
    return ai.translateFile(filename);
}
