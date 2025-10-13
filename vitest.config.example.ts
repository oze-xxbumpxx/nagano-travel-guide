import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest設定ファイルの例
 * 
 * プロジェクトに適用する場合：
 * 1. npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
 * 2. このファイルを vitest.config.ts にリネーム
 * 3. package.jsonのtestスクリプトを "vitest" に変更
 */

export default defineConfig({
  plugins: [react()],
  
  test: {
    // テスト環境（Reactの場合はjsdom）
    environment: 'jsdom',
    
    // グローバル設定
    globals: true,
    
    // セットアップファイル
    setupFiles: ['./src/setupTests.ts'],
    
    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
      ],
    },
    
    // テストファイルのパターン
    include: [
      '**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
      '**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    
    // 除外するファイル
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.next',
      '.nuxt',
    ],
    
    // タイムアウト設定
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // モックのリセット
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    
    // 並列実行の設定
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
  
  // エイリアス設定（必要に応じて）
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
});
