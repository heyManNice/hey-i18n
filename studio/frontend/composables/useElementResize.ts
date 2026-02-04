import { onMounted, onUnmounted, ref, type Ref } from 'vue';

export function useElementResize(
    target: string | HTMLElement | Ref<HTMLElement | null>,
    callback: (entry: ResizeObserverEntry) => void
) {
    let observer: ResizeObserver | null = null;

    onMounted(() => {
        let element: HTMLElement | null = null;
        if (typeof target === 'string') {
            element = document.querySelector(target);
        } else if ('value' in target) {
            element = target.value;
        } else {
            element = target;
        }

        if (element) {
            observer = new ResizeObserver((entries) => {
                if (entries.length > 0) {
                    callback(entries[0]);
                }
            });
            observer.observe(element);
        }
    });

    onUnmounted(() => {
        observer?.disconnect();
    });
}
