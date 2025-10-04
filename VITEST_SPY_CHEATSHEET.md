# Vitest vi.spy チートシート

## 📋 目次
- [スパイの作成](#スパイの作成)
- [呼び出しの確認](#呼び出しの確認)
- [戻り値のモック](#戻り値のモック)
- [リセット・リストア](#リセットリストア)
- [よく使うパターン](#よく使うパターン)

---

## スパイの作成

```typescript
// オブジェクトのメソッドをスパイ
const spy = vi.spyOn(object, 'methodName');

// モック関数を作成
const mockFn = vi.fn();

// 実装付きモック関数
const mockFn = vi.fn((a, b) => a + b);

// モジュール全体をモック
vi.mock('axios');
```

---

## 呼び出しの確認

### 基本

```typescript
// 呼ばれたか
expect(spy).toHaveBeenCalled();
expect(spy).not.toHaveBeenCalled();

// 回数
expect(spy).toHaveBeenCalledTimes(3);

// 引数
expect(spy).toHaveBeenCalledWith(arg1, arg2);
```

### 詳細な確認

```typescript
// 最初の呼び出し
expect(spy).toHaveBeenNthCalledWith(1, arg1, arg2);

// 最後の呼び出し
expect(spy).toHaveBeenLastCalledWith(arg1, arg2);

// 呼び出し履歴を取得
const calls = spy.mock.calls;
// [[arg1, arg2], [arg1, arg2], ...]

// 最初の呼び出しの引数
const firstCall = spy.mock.calls[0];
```

### Matchers

```typescript
expect(spy).toHaveBeenCalledWith(
  expect.any(String),                    // 任意の文字列
  expect.any(Number),                    // 任意の数値
  expect.anything(),                     // undefined/null以外
  expect.stringContaining('text'),       // 部分一致
  expect.stringMatching(/regex/),        // 正規表現
  expect.objectContaining({ id: 1 }),    // オブジェクトの部分一致
  expect.arrayContaining([1, 2]),        // 配列の部分一致
);
```

---

## 戻り値のモック

### 同期関数

```typescript
// 固定値
spy.mockReturnValue(42);

// 1回だけ
spy.mockReturnValueOnce(1)
   .mockReturnValueOnce(2)
   .mockReturnValueOnce(3);

// カスタム実装
spy.mockImplementation((a, b) => a + b);

// 1回だけ実装
spy.mockImplementationOnce(() => 'first')
   .mockImplementationOnce(() => 'second');
```

### 非同期関数

```typescript
// Promise を返す
spy.mockResolvedValue({ data: 'success' });

// Promise をリジェクト
spy.mockRejectedValue(new Error('Failed'));

// 1回だけ
spy.mockResolvedValueOnce(data1)
   .mockResolvedValueOnce(data2);

// カスタム実装
spy.mockImplementation(async (id) => {
  return { id, name: 'User' };
});
```

---

## リセット・リストア

```typescript
// 呼び出し履歴をクリア（モックは維持）
spy.mockClear();

// モックをリセット（履歴とモックをクリア）
spy.mockReset();

// 元の実装に戻す
spy.mockRestore();

// すべてのモックをリストア
vi.restoreAllMocks();

// すべてのモックをクリア
vi.clearAllMocks();

// すべてのモックをリセット
vi.resetAllMocks();
```

---

## よく使うパターン

### パターン1: APIモック

```typescript
const mockApiClient = {
  get: vi.fn().mockResolvedValue({ data: 'success' }),
  post: vi.fn().mockResolvedValue({ id: 1 }),
};
```

### パターン2: イベントハンドラー

```typescript
const handleClick = vi.fn();
fireEvent.click(button);
expect(handleClick).toHaveBeenCalledTimes(1);
```

### パターン3: axios

```typescript
import axios from 'axios';
vi.mock('axios');

vi.mocked(axios.get).mockResolvedValue({ data: mockData });
```

### パターン4: localStorage

```typescript
vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('value');
vi.spyOn(Storage.prototype, 'setItem');

localStorage.setItem('key', 'value');
expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value');
```

### パターン5: タイマー

```typescript
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.restoreAllMocks());

it('test', () => {
  const callback = vi.fn();
  setTimeout(callback, 1000);
  
  vi.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();
});
```

### パターン6: Date

```typescript
const mockDate = new Date('2024-01-01');
vi.setSystemTime(mockDate);

// テスト実行

vi.useRealTimers();
```

### パターン7: 連続エラー→成功

```typescript
spy
  .mockRejectedValueOnce(new Error('Fail 1'))
  .mockRejectedValueOnce(new Error('Fail 2'))
  .mockResolvedValueOnce({ success: true });
```

### パターン8: コールバック

```typescript
const callback = vi.fn();

function doSomething(cb: Function) {
  cb('result');
}

doSomething(callback);
expect(callback).toHaveBeenCalledWith('result');
```

---

## beforeEach/afterEach パターン

```typescript
describe('MyTests', () => {
  let spy: SpyInstance;

  beforeEach(() => {
    spy = vi.spyOn(myObject, 'myMethod');
  });

  afterEach(() => {
    spy.mockRestore();
    // または
    vi.restoreAllMocks();
  });

  it('test', () => {
    // テストコード
  });
});
```

---

## 便利なショートカット

```typescript
// globals: true の場合、viをインポート不要
// vitest.config.ts で globals: true を設定

// モックの作成と実装を同時に
const mock = vi.fn(() => 'result');

// モックの戻り値を連鎖
mock
  .mockReturnValueOnce('first')
  .mockReturnValueOnce('second')
  .mockReturnValue('default');

// 引数を取得
const [firstArg, secondArg] = mock.mock.calls[0];

// 戻り値を取得
const results = mock.mock.results;
// [{ type: 'return', value: 'result' }, ...]
```

---

## エラーケースのテスト

```typescript
// 同期エラー
expect(() => functionThatThrows()).toThrow('Error message');
expect(() => functionThatThrows()).toThrow(CustomError);

// 非同期エラー
await expect(asyncFunction()).rejects.toThrow('Error message');
await expect(asyncFunction()).rejects.toBeInstanceOf(CustomError);
```

---

## デバッグ

```typescript
// モックの呼び出し情報を表示
console.log(spy.mock.calls);
console.log(spy.mock.results);

// モックがクリアされているか確認
expect(spy).not.toHaveBeenCalled();
expect(spy.mock.calls.length).toBe(0);
```

---

## 📚 クイックリファレンス表

| やりたいこと | コード |
|-------------|--------|
| スパイ作成 | `vi.spyOn(obj, 'method')` |
| モック関数 | `vi.fn()` |
| 戻り値設定 | `.mockReturnValue(val)` |
| Promise設定 | `.mockResolvedValue(val)` |
| エラー設定 | `.mockRejectedValue(err)` |
| 呼び出し確認 | `.toHaveBeenCalled()` |
| 回数確認 | `.toHaveBeenCalledTimes(n)` |
| 引数確認 | `.toHaveBeenCalledWith(...)` |
| 履歴クリア | `.mockClear()` |
| 元に戻す | `.mockRestore()` |

---

## 💡 Tips

1. **globals を有効化** → `vitest.config.ts` で `globals: true`
2. **並列実行に注意** → グローバルなモックは共有される
3. **afterEach でクリーンアップ** → テスト間の影響を防ぐ
4. **具体的なアサーション** → `toHaveBeenCalled()` より `toHaveBeenCalledWith()` を使う
5. **タイプセーフ** → `vi.mocked()` を使って型を保持

---

これで`vi.spy`の基本から応用まで網羅できます！🎉
