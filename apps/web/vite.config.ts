/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@fiilar/types': path.resolve(__dirname, '../../libs/types/src/index.ts'),
        '@fiilar/ui': path.resolve(__dirname, '../../libs/ui/src/index.ts'),
        '@fiilar/utils': path.resolve(__dirname, '../../libs/utils/src/index.ts'),
        '@fiilar/escrow': path.resolve(__dirname, '../../libs/escrow/src/index.ts'),
        '@fiilar/search': path.resolve(__dirname, '../../libs/search/src/index.ts'),
        '@fiilar/booking': path.resolve(__dirname, '../../libs/booking/src/index.ts'),
        '@fiilar/notifications': path.resolve(__dirname, '../../libs/notifications/src/index.ts'),
        '@fiilar/messaging': path.resolve(__dirname, '../../libs/messaging/src/index.ts'),
        '@fiilar/kyc': path.resolve(__dirname, '../../libs/kyc/src/index.ts'),
        '@fiilar/calendar': path.resolve(__dirname, '../../libs/calendar/src/index.ts'),
        '@fiilar/reviews': path.resolve(__dirname, '../../libs/reviews/src/index.ts'),
        '@fiilar/admin': path.resolve(__dirname, '../../libs/admin/src/index.ts'),
        '@fiilar/storage': path.resolve(__dirname, '../../libs/storage/src/index.ts'),
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'charts': ['recharts'],
            'icons': ['lucide-react'],
          },
        },
      },
    },
  };
});
