# Vitest vi.spy 使い方ガイド

## 目次
1. [vi.spyとは](#vispyとは)
2. [基本的な使い方](#基本的な使い方)
3. [よく使うメソッド](#よく使うメソッド)
4. [実用例](#実用例)
5. [ベストプラクティス](#ベストプラクティス)

## vi.spyとは

`vi.spy`は、Vitestが提供するスパイ（spy）機能で、関数の呼び出しを監視したり、モック（mock）したりするためのツールです。

### スパイでできること
- 関数が呼ばれたかどうかを確認
- 何回呼ばれたかを確認
- どんな引数で呼ばれたかを確認
- 戻り値を変更（モック）
- 元の実装を保持したまま監視

## 基本的な使い方

### 1. vi.spyOn() - オブジェクトのメソッドをスパイ

```typescript
import { vi, expect } from 'vitest';

const calculator = {
  add: (a: number, b: number) => a + b,
};

// スパイを作成
const spy = vi.spyOn(calculator, 'add');

// 関数を実行
calculator.add(2, 3);

// 確認
expect(spy).toHaveBeenCalled();
expect(spy).toHaveBeenCalledWith(2, 3);
```

### 2. vi.fn() - モック関数を作成

```typescript
// モック関数を作成
const mockFunction = vi.fn();

// 関数を実行
mockFunction('hello');

// 確認
expect(mockFunction).toHaveBeenCalledWith('hello');
```

### 3. 戻り値をモックする

```typescript
const spy = vi.spyOn(calculator, 'add').mockReturnValue(100);

const result = calculator.add(2, 3);
expect(result).toBe(100); // 元の実装ではなくモック値が返される
```

## よく使うメソッド

### 呼び出しの確認

```typescript
// 呼ばれたかどうか
expect(spy).toHaveBeenCalled();
expect(spy).not.toHaveBeenCalled();

// 呼ばれた回数
expect(spy).toHaveBeenCalledTimes(3);

// 特定の引数で呼ばれたか
expect(spy).toHaveBeenCalledWith(arg1, arg2);

// N番目の呼び出しを確認
expect(spy).toHaveBeenNthCalledWith(2, arg1, arg2);

// 最後の呼び出しを確認
expect(spy).toHaveBeenLastCalledWith(arg1, arg2);
```

### 戻り値のモック

```typescript
// 固定値を返す
spy.mockReturnValue(42);

// Promise を返す
spy.mockResolvedValue({ data: 'success' });

// エラーを返す
spy.mockRejectedValue(new Error('Failed'));

// 呼び出しごとに異なる値を返す
spy
  .mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValueOnce(3);

// カスタム実装
spy.mockImplementation((a, b) => a + b + 1);
```

### スパイのリセット・リストア

```typescript
// 呼び出し履歴をクリア（モックは維持）
spy.mockClear();

// モックをリセット（履歴とモックをクリア）
spy.mockReset();

// 元の実装に戻す
spy.mockRestore();
```

## 実用例

### 例1: API呼び出しのテスト

```typescript
import { vi, expect, describe, it } from 'vitest';

class UserService {
  async fetchUser(id: number) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
}

describe('UserService', () => {
  it('ユーザーを取得する', async () => {
    const service = new UserService();
    const mockUser = { id: 1, name: '田中太郎' };

    // fetchUserをモック
    const spy = vi.spyOn(service, 'fetchUser')
      .mockResolvedValue(mockUser);

    const user = await service.fetchUser(1);

    expect(user).toEqual(mockUser);
    expect(spy).toHaveBeenCalledWith(1);
  });
});
```

### 例2: Reactコンポーネントのイベントハンドラー

```typescript
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

function Button({ onClick }) {
  return <button onClick={onClick}>クリック</button>;
}

it('ボタンクリック時にhandlerが呼ばれる', () => {
  const handleClick = vi.fn();
  const { getByText } = render(<Button onClick={handleClick} />);

  fireEvent.click(getByText('クリック'));

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 例3: 外部モジュールのモック

```typescript
import axios from 'axios';
import { vi } from 'vitest';

// モジュール全体をモック
vi.mock('axios');

it('axiosでデータを取得', async () => {
  const mockData = { id: 1, name: 'Test' };

  // axios.getをモック
  vi.mocked(axios.get).mockResolvedValue({ data: mockData });

  const response = await axios.get('/api/test');

  expect(response.data).toEqual(mockData);
  expect(axios.get).toHaveBeenCalledWith('/api/test');
});
```

### 例4: タイマーのテスト

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

describe('タイマーのテスト', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1秒後にコールバックが呼ばれる', () => {
    const callback = vi.fn();

    setTimeout(callback, 1000);

    // 1秒進める
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
  });
});
```

### 例5: localStorage のモック

```typescript
import { vi, beforeEach } from 'vitest';

describe('localStorage', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-value');
  });

  it('localStorageに保存', () => {
    localStorage.setItem('key', 'value');

    expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });

  it('localStorageから取得', () => {
    const value = localStorage.getItem('key');

    expect(value).toBe('test-value');
    expect(localStorage.getItem).toHaveBeenCalledWith('key');
  });
});
```

## ベストプラクティス

### 1. beforeEach でスパイをリセット

```typescript
describe('テストスイート', () => {
  let spy: any;

  beforeEach(() => {
    spy = vi.spyOn(obj, 'method');
  });

  afterEach(() => {
    spy.mockRestore(); // または vi.restoreAllMocks()
  });
});
```

### 2. 具体的なアサーションを使う

```typescript
// ❌ あまり良くない
expect(spy).toHaveBeenCalled();

// ✅ より良い
expect(spy).toHaveBeenCalledTimes(1);
expect(spy).toHaveBeenCalledWith(expectedArg1, expectedArg2);
```

### 3. matchersを活用

```typescript
expect(spy).toHaveBeenCalledWith(
  expect.any(String),           // 任意の文字列
  expect.stringContaining('test'), // 'test'を含む文字列
  expect.objectContaining({ id: 1 }), // idプロパティを持つオブジェクト
  expect.arrayContaining([1, 2])  // 1と2を含む配列
);
```

### 4. 非同期処理のテスト

```typescript
// ✅ mockResolvedValue を使用
spy.mockResolvedValue(data);

// ✅ mockRejectedValue を使用
spy.mockRejectedValue(new Error('エラー'));

// ❌ 避ける
spy.mockReturnValue(Promise.resolve(data));
```

### 5. エラーケースもテスト

```typescript
it('エラー時の動作を確認', async () => {
  const spy = vi.spyOn(service, 'fetchData')
    .mockRejectedValue(new Error('Network error'));

  await expect(service.fetchData()).rejects.toThrow('Network error');
  expect(spy).toHaveBeenCalled();
});
```

## まとめ

- `vi.spyOn(obj, 'method')`: メソッドをスパイ
- `vi.fn()`: モック関数を作成
- `.mockReturnValue()`: 戻り値をモック
- `.mockResolvedValue()`: Promise をモック
- `.toHaveBeenCalledWith()`: 引数を検証
- `.mockRestore()`: 元に戻す

これらを組み合わせることで、効果的な単体テストを書くことができます！

## 参考リンク

- [Vitest 公式ドキュメント - Mocking](https://vitest.dev/guide/mocking.html)
- [Vitest API - vi](https://vitest.dev/api/vi.html)
- [Testing Library](https://testing-library.com/)
