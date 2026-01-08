import { build } from 'esbuild'

build({
    entryPoints: ['backend/main.ts'],
    bundle: true,
    platform: 'node',
    target: ['node20'],
    outdir: '../dist/hey-i18n-studio/backend',
    sourcemap: false,
    minify: true
}).then(() => console.log('Backend build completed.'));
