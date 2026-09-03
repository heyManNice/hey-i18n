import { reactive, ref } from 'vue';

import backend from '../../../rpc/backend';
import { useReactivePromise } from '../../../utils/promise';
import type { AiPlatform } from '../../../../backend/services/ai';

export function useAiData() {
    const r = useReactivePromise(async function () {
        return backend.ai.getAiConfig();
    });

    const apiKeyInput = ref('');
    const testResult = reactive({
        ok: false,
        message: '',
    });

    async function save() {
        if (!r.d) {
            return;
        }
        await backend.ai.setAiConfig({
            provider: r.d.provider,
            platform: r.d.platform as AiPlatform,
            model: r.d.model,
            apiKey: apiKeyInput.value,
        });
        apiKeyInput.value = '';
        await r.update();
    }

    async function testConnection() {
        try {
            const result = await backend.ai.testConnection();
            testResult.ok = true;
            testResult.message = `连接成功：${result.content}`;
        } catch (error) {
            testResult.ok = false;
            testResult.message = (error as Error).message;
        }
    }

    return {
        r,
        apiKeyInput,
        testResult,
        save,
        testConnection,
    };
}
