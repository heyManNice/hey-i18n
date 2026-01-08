import Index from './Index.vue';
import { createApp } from 'vue';

import { useDark } from '@vueuse/core';
useDark();

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

createApp(Index).mount(document.body);