/**
 * Vitest セットアップファイルの例
 * 
 * テストの実行前に一度だけ実行される設定ファイル
 * vitest.config.tsの setupFiles で指定する
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Testing Library のカスタムマッチャーを追加
// これにより toBeInTheDocument() などが使えるようになる
expect.extend(matchers);

// 各テスト後にReactコンポーネントをクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルなモックの設定例

// 1. fetch のモック
global.fetch = vi.fn();

// 2. localStorage のモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// 3. matchMedia のモック（レスポンシブデザインのテスト用）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 4. IntersectionObserver のモック
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// 5. ResizeObserver のモック
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// 6. console のエラーやワーニングを抑制（必要に応じて）
// テスト中の予期されるエラーメッセージを非表示にする
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // React の特定のワーニングを抑制
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    // 特定のワーニングを抑制
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// 7. 環境変数のモック
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:3000/api';

// 8. グローバルなテストユーティリティ
export const mockUser = {
  id: 1,
  name: 'テストユーザー',
  email: 'test@example.com',
};

export const waitForTimeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 9. カスタムマッチャーの追加例
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// TypeScript用の型定義拡張
declare module 'vitest' {
  interface Assertion {
    toBeWithinRange(floor: number, ceiling: number): void;
  }
}
