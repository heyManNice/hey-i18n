import {
    defineAsyncComponent,
} from 'vue'

import Loading from './Loading.vue';
import Error from './Error.vue';

export function useAsyncComponent(loader: () => Promise<any>) {
    return defineAsyncComponent({
        loader,
        loadingComponent: Loading,
        errorComponent: Error
    });
}