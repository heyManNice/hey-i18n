import {
    Component,
    render,
    h
} from 'vue';

class DialogFramework {
    private backdrop;
    private window;
    private component;

    private onCloseCallback = () => { };

    constructor(component: Component) {
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

        this.component = component;
    }

    public open() {
        render(h(this.component), this.window);

        this.backdrop.appendChild(this.window);
        document.body.appendChild(this.backdrop);
    }

    public close() {
        this.backdrop.style.animation = 'backdrop-fade-out 0.3s ease-out forwards';
        this.window.style.animation = 'window-scale-out 0.1s ease-out forwards';
        this.onCloseCallback();
        setTimeout(() => {
            render(null, this.window);
            document.body.removeChild(this.backdrop);
            this.backdrop.style.animation = '';
            this.window.style.animation = '';
        }, 300);

    }
    // 设置窗口大小
    public setSize(width: string, height: string) {
        this.window.style.width = width;
        this.window.style.height = height;
    }

    // 设置关闭回调
    public setOnCloseCallback(callback: () => void) {
        this.onCloseCallback = callback;
    }
}

export default DialogFramework;