import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '**/node_modules/**',
            '.git/**',
            'package-lock.json',
            '**/package-lock.json',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tseslint.parser,
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
    },
    {
        files: ['studio/backend/**/*.ts', 'studio/backend.build.ts', 'eslint.config.mjs'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ['src/**/*.ts', 'studio/frontend/**/*.{ts,vue}', 'studio/vite.config.ts'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    {
        rules: {
            // Vue 组件名不需要强制多词（Index/Editor/Confirm 等单文件组件）
            'vue/multi-word-component-names': 'off',
            // 由 Vue withDefaults / 模板逻辑保证
            'vue/require-default-prop': 'off',
            // 项目内多处刻意使用 any / console（运行时错误提示、RPC 边界）
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
        },
    },
    prettier,
);
