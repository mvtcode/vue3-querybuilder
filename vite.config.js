import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), vueJsx()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Vue3QueryBuilder',
            fileName: (format) => `vue3-querybuilder.${format}.js`,
        },
        rollupOptions: {
            external: [
                'vue',
                'element-plus',
                '@element-plus/icons-vue',
                'vue-i18n'
            ],
            output: {
                globals: {
                    vue: 'Vue',
                    'element-plus': 'ElementPlus',
                    '@element-plus/icons-vue': 'ElementPlusIconsVue',
                    'vue-i18n': 'VueI18n',
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') {
                        return 'vue3-querybuilder.css';
                    }
                    return assetInfo.name || 'asset';
                },
            },
        },
    },
});
