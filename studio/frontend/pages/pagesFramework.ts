import {
    defineAsyncComponent,
    createApp
} from 'vue';

import Loading from './Loading.vue';
import Error from './Error.vue';

class PagesFramework {
    private backdrop;
    private window;
    private component;

    private vueApp: ReturnType<typeof createApp> | null = null;

    constructor(loader: () => Promise<any>) {
        this.backdrop = document.createElement('div');
        this.backdrop.classList.add('pages-backdrop');
        this.backdrop.addEventListener('click', (event: Event) => {
            if (event.target !== this.backdrop) {
                return;
            }
            this.close();
        });

        this.window = document.createElement('div');
        this.window.classList.add('pages-window');

        this.component = defineAsyncComponent({
            loader,
            loadingComponent: Loading,
            errorComponent: Error
        });
    }

    public open() {
        this.vueApp = createApp(this.component);
        this.vueApp.mount(this.window);

        this.backdrop.appendChild(this.window);
        document.body.appendChild(this.backdrop);
    }

    public close() {
        this.backdrop.style.animation = 'backdrop-fade-out 0.3s ease-out forwards';
        this.window.style.animation = 'window-scale-out 0.1s ease-out forwards';
        setTimeout(() => {
            if (this.vueApp) {
                this.vueApp.unmount();
                this.vueApp = null;
            }
            document.body.removeChild(this.backdrop);
            this.backdrop.style.animation = '';
            this.window.style.animation = '';
        }, 300);

    }
}

export default PagesFramework;