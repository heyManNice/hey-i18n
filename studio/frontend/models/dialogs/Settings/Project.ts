import {
    ref,
    watch
} from 'vue';

import mExplorer from '../../Explorer';

import {
    useReactivePromise
} from '../../../utils/promise';

import backend from '../../../rpc/backend';

export function useProjectData() {
    return useReactivePromise(async function () {
        const config = await backend.settings.project.getI18nConfig();

        const sourcesLocale = ref(config.sourcesLocale);
        const defaultLocale = ref(config.defaultLocale);

        watch([sourcesLocale, defaultLocale], () => {
            backend.settings.project.setI18nConfig({
                sourcesLocale: sourcesLocale.value,
                defaultLocale: defaultLocale.value,
            }).then(() => {
                mExplorer.fUpdateFiles();
            });
        });
        return {
            sourcesLocale,
            defaultLocale,
        };
    });
}