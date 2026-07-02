import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        tailwindcss(),

        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.js',
            registerType: 'prompt',
            manifest: false,

            // Don't throw on large files — warn instead
            throwMaximumFileSizeToCacheInBytes: false,

            devOptions: {
                enabled: true,
                type: 'module',
            },

            // For injectManifest, Workbox's injectManifest() options go here
            injectManifest: {
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
                globPatterns: [
                    '**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}',
                ],
                globIgnores: [
                    'firebase-messaging-sw.js',
                    'sw.js',
                    'sw.mjs',
                ],
            },
        }),
    ],
});
