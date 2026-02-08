import {
    reactive
} from 'vue';



// vue 响应式的承诺
export function useReactivePromise<T>(promiseFn: () => Promise<T>) {
    const r = reactive({
        d: null as T | null, // data
        e: null as Error | null, // error
        l: false, // is loading
        update: () => { } // 重发数据
    });

    async function run() {
        r.l = true;

        try {
            // 此时 Awaited<T> 可以安全地赋值给 UnwrapRef<T>
            // @ts-ignore
            r.d = await promiseFn();
        } catch (err: any) {
            return r.e = err instanceof Error ? err : new Error(String(err))
        } finally {
            r.l = false;
        }
    }
    r.update = () => {
        run();
    }

    run()
    return r;
}
