import {
    reactive
} from 'vue';



// vue 响应式的承诺
export function useReactivePromise<T>(promiseFn: () => Promise<T>) {
    const result = reactive({
        data: null as T | null,
        error: null as Error | null,
        isLoading: false
    });

    async function run() {
        result.isLoading = true;

        try {
            // 此时 Awaited<T> 可以安全地赋值给 UnwrapRef<T>
            // @ts-ignore
            result.data = await promiseFn();
        } catch (err: any) {
            return result.error = err instanceof Error ? err : new Error(String(err))
        } finally {
            result.isLoading = false;
        }
    }

    run()
    return result;
}
