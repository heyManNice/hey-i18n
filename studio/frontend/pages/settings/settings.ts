import {
    createApp,
    type App
} from 'vue'

import { useAsyncComponent } from '../AsyncComponent';


class Settings {
    private backdrop;
    private window;
    private component;

    private vueApp: App<Element> | null = null;

    constructor() {
        this.backdrop = document.createElement('div');
        this.backdrop.classList.add('pages-backdrop');

        this.window = document.createElement('div');
        this.window.classList.add('pages-window');

        this.component = useAsyncComponent(() => import('./Settings.vue'));
    }

    public init() {
        this.vueApp = createApp(this.component);
        this.vueApp.mount(this.window);

        this.backdrop.appendChild(this.window);
        document.body.appendChild(this.backdrop);
    }

    public close() {
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }
        document.body.removeChild(this.backdrop);
    }
}

export default new Settings();