# mockReturnValue / mockResolvedValue / mockRejectedValue 比較チャート

## 📊 一目で分かる比較表

| 項目 | mockReturnValue | mockResolvedValue | mockRejectedValue |
|------|----------------|-------------------|-------------------|
| **戻り値の型** | 任意の値 | Promise<成功値> | Promise<エラー> |
| **非同期か** | ❌ 同期 | ✅ 非同期 | ✅ 非同期 |
| **await必要** | ❌ 不要 | ✅ 必要 | ✅ 必要 |
| **主な用途** | 通常の関数 | async関数の成功 | エラーケース |
| **エイリアス** | なし | `mockReturnValue(Promise.resolve())` | `mockReturnValue(Promise.reject())` |

---

## 🔄 処理フローの違い

### mockReturnValue()
```
関数呼び出し → 即座に値を返す
     ↓
   結果取得
```

### mockResolvedValue()
```
関数呼び出し → Promise生成 → await → 値を返す
     ↓              ↓            ↓
  Promise       待機中        結果取得
```

### mockRejectedValue()
```
関数呼び出し → Promise生成 → await → エラーを投げる
     ↓              ↓            ↓
  Promise       待機中      try-catchで捕捉
```

---

## 💡 使用例の比較

### 同じ値を返す例

```typescript
// 同期: mockReturnValue
const fn1 = vi.fn();
fn1.mockReturnValue(42);
const result1 = fn1();
console.log(result1); // 42

// 非同期成功: mockResolvedValue
const fn2 = vi.fn();
fn2.mockResolvedValue(42);
const result2 = await fn2();
console.log(result2); // 42

// 非同期エラー: mockRejectedValue
const fn3 = vi.fn();
fn3.mockRejectedValue(new Error('エラー'));
try {
  await fn3();
} catch (error) {
  console.log(error.message); // 'エラー'
}
```

---

## 🎯 使い分けフローチャート

```
テスト対象の関数は？
│
├─ 通常の関数（非async）
│  └─→ mockReturnValue() を使用
│      例: const getName = vi.fn();
│          getName.mockReturnValue('田中');
│
├─ async関数 または Promiseを返す関数
│  │
│  ├─ 成功ケースをテスト？
│  │  └─→ mockResolvedValue() を使用
│  │      例: fetchUser.mockResolvedValue({ id: 1 });
│  │
│  └─ エラーケースをテスト？
│     └─→ mockRejectedValue() を使用
│         例: apiCall.mockRejectedValue(new Error());
│
└─ コールバック関数
   └─→ mockReturnValue() または mockImplementation()
       例: callback.mockReturnValue(true);
```

---

## 📝 コード例による比較

### ケース1: 単純な値を返す

```typescript
// mockReturnValue - 同期
const getAge = vi.fn();
getAge.mockReturnValue(30);
console.log(getAge()); // 30（即座に取得）

// mockResolvedValue - 非同期
const fetchAge = vi.fn();
fetchAge.mockResolvedValue(30);
console.log(await fetchAge()); // 30（awaitが必要）

// mockRejectedValue - エラー
const validateAge = vi.fn();
validateAge.mockRejectedValue(new Error('無効な年齢'));
await expect(validateAge()).rejects.toThrow(); // エラーを期待
```

### ケース2: オブジェクトを返す

```typescript
const user = { id: 1, name: '田中太郎' };

// mockReturnValue
const getUser = vi.fn();
getUser.mockReturnValue(user);
const result1 = getUser(); // すぐに取得

// mockResolvedValue
const fetchUser = vi.fn();
fetchUser.mockResolvedValue(user);
const result2 = await fetchUser(); // awaitが必要

// mockRejectedValue
const createUser = vi.fn();
createUser.mockRejectedValue(new Error('作成失敗'));
await expect(createUser()).rejects.toThrow('作成失敗');
```

### ケース3: 配列を返す

```typescript
const items = ['item1', 'item2', 'item3'];

// mockReturnValue
const getItems = vi.fn();
getItems.mockReturnValue(items);
console.log(getItems()); // ['item1', 'item2', 'item3']

// mockResolvedValue
const fetchItems = vi.fn();
fetchItems.mockResolvedValue(items);
console.log(await fetchItems()); // ['item1', 'item2', 'item3']

// mockRejectedValue
const loadItems = vi.fn();
loadItems.mockRejectedValue(new Error('読み込み失敗'));
await expect(loadItems()).rejects.toThrow();
```

---

## ⚙️ 複数回呼び出しのパターン

### Once バリアント

```typescript
// mockReturnValueOnce
const fn1 = vi.fn();
fn1.mockReturnValueOnce(1)
   .mockReturnValueOnce(2)
   .mockReturnValue(0);

console.log(fn1()); // 1
console.log(fn1()); // 2
console.log(fn1()); // 0
console.log(fn1()); // 0

// mockResolvedValueOnce
const fn2 = vi.fn();
fn2.mockResolvedValueOnce('first')
   .mockResolvedValueOnce('second')
   .mockResolvedValue('default');

console.log(await fn2()); // 'first'
console.log(await fn2()); // 'second'
console.log(await fn2()); // 'default'

// mockRejectedValueOnce
const fn3 = vi.fn();
fn3.mockRejectedValueOnce(new Error('Fail 1'))
   .mockRejectedValueOnce(new Error('Fail 2'))
   .mockResolvedValue('Success');

await expect(fn3()).rejects.toThrow('Fail 1');
await expect(fn3()).rejects.toThrow('Fail 2');
expect(await fn3()).toBe('Success');
```

---

## 🔀 組み合わせパターン

### パターン1: 成功 → エラー → 成功

```typescript
const apiCall = vi.fn();

apiCall
  .mockResolvedValueOnce({ data: 'OK' })        // 1回目: 成功
  .mockRejectedValueOnce(new Error('Error'))    // 2回目: エラー
  .mockResolvedValue({ data: 'OK again' });     // 3回目以降: 成功

const result1 = await apiCall();
console.log(result1); // { data: 'OK' }

try {
  await apiCall();
} catch (error) {
  console.log(error.message); // 'Error'
}

const result3 = await apiCall();
console.log(result3); // { data: 'OK again' }
```

### パターン2: リトライロジック

```typescript
const fetchData = vi.fn();

// 最初の2回は失敗、3回目で成功
fetchData
  .mockRejectedValueOnce(new Error('Network error'))
  .mockRejectedValueOnce(new Error('Network error'))
  .mockResolvedValue({ data: 'Success' });

// リトライ処理
async function fetchWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchData();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}

const result = await fetchWithRetry();
console.log(result); // { data: 'Success' }
```

---

## 🎭 実際のユースケース

### ユースケース1: 認証

```typescript
// ログイン成功
const login = vi.fn();
login.mockResolvedValue({ token: 'abc123', user: { name: '田中' } });

// ログイン失敗
const loginFail = vi.fn();
loginFail.mockRejectedValue(new Error('認証失敗'));

// セッションチェック（同期）
const isLoggedIn = vi.fn();
isLoggedIn.mockReturnValue(true);
```

### ユースケース2: データベース操作

```typescript
// 読み取り成功
const findUser = vi.fn();
findUser.mockResolvedValue({ id: 1, name: '田中' });

// 書き込み成功（戻り値なし）
const saveUser = vi.fn();
saveUser.mockResolvedValue(undefined);

// 削除失敗
const deleteUser = vi.fn();
deleteUser.mockRejectedValue(new Error('削除権限なし'));
```

### ユースケース3: API呼び出し

```typescript
import axios from 'axios';

// GET成功
vi.mocked(axios.get).mockResolvedValue({
  data: { id: 1, name: 'Test' },
  status: 200,
});

// POST成功
vi.mocked(axios.post).mockResolvedValue({
  data: { id: 2, name: 'Created' },
  status: 201,
});

// DELETE失敗
vi.mocked(axios.delete).mockRejectedValue({
  response: { status: 403, data: { error: '権限なし' } },
});
```

---

## ⚠️ よくある間違い

### 間違い1: 非同期関数に mockReturnValue

```typescript
// ❌ 間違い
const asyncFn = vi.fn();
asyncFn.mockReturnValue({ data: 'test' }); // Promiseではない

const result = await asyncFn();
console.log(result); // 動くが正しくない

// ✅ 正しい
asyncFn.mockResolvedValue({ data: 'test' });
const result = await asyncFn();
console.log(result); // これが正しい
```

### 間違い2: mockReturnValue の後に Once

```typescript
// ❌ 間違い
const fn = vi.fn();
fn.mockReturnValue(0);    // これが優先される
fn.mockReturnValueOnce(1); // 無視される

console.log(fn()); // 0（1ではない）

// ✅ 正しい
fn.mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValue(0);

console.log(fn()); // 1
console.log(fn()); // 2
console.log(fn()); // 0
```

### 間違い3: await を忘れる

```typescript
// ❌ 間違い
const asyncFn = vi.fn();
asyncFn.mockResolvedValue(42);

const result = asyncFn(); // Promiseオブジェクトが返る
console.log(result); // Promise { <pending> }

// ✅ 正しい
const result = await asyncFn();
console.log(result); // 42
```

### 間違い4: 同期エラーに mockRejectedValue

```typescript
// ❌ 間違い（動かない）
const syncFn = vi.fn();
syncFn.mockRejectedValue(new Error('Error'));
// mockRejectedValueは非同期専用

// ✅ 正しい（同期エラー）
syncFn.mockImplementation(() => {
  throw new Error('Error');
});

// または
syncFn.mockReturnValue((() => {
  throw new Error('Error');
})());
```

---

## 🧪 テストでの検証方法

### mockReturnValue の検証

```typescript
const fn = vi.fn().mockReturnValue('test');

// 値の検証
expect(fn()).toBe('test');

// 呼び出しの検証
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(1);
```

### mockResolvedValue の検証

```typescript
const fn = vi.fn().mockResolvedValue('test');

// 値の検証（awaitが必要）
expect(await fn()).toBe('test');

// resolves を使用
await expect(fn()).resolves.toBe('test');

// 呼び出しの検証
expect(fn).toHaveBeenCalled();
```

### mockRejectedValue の検証

```typescript
const fn = vi.fn().mockRejectedValue(new Error('Failed'));

// エラーの検証
await expect(fn()).rejects.toThrow('Failed');

// エラーの型を検証
await expect(fn()).rejects.toBeInstanceOf(Error);

// try-catch での検証
try {
  await fn();
  expect.fail('エラーが投げられるべき');
} catch (error: any) {
  expect(error.message).toBe('Failed');
}
```

---

## 🔧 実践的なヒント

### ヒント1: ファクトリー関数を活用

```typescript
function createMockUser(overrides = {}) {
  return {
    id: 1,
    name: '田中太郎',
    email: 'tanaka@example.com',
    ...overrides,
  };
}

// 使用例
const fetchUser = vi.fn();
fetchUser.mockResolvedValue(createMockUser({ name: 'カスタム名' }));
```

### ヒント2: テストごとにリセット

```typescript
describe('Tests', () => {
  const mockFn = vi.fn();

  afterEach(() => {
    mockFn.mockReset(); // またはmockClear()
  });

  it('test 1', async () => {
    mockFn.mockResolvedValue('test1');
    // ...
  });

  it('test 2', async () => {
    mockFn.mockResolvedValue('test2');
    // test1の設定は残っていない
  });
});
```

### ヒント3: TypeScript の型安全性

```typescript
interface User {
  id: number;
  name: string;
}

const fetchUser = vi.fn<[], Promise<User>>();

// ✅ 正しい型
fetchUser.mockResolvedValue({ id: 1, name: 'Test' });

// ❌ 型エラー
fetchUser.mockResolvedValue({ id: 1 }); // nameがない
```

---

## 📚 まとめ

### 選択ガイド

| 状況 | 使うメソッド | 理由 |
|------|------------|------|
| 通常の関数 | `mockReturnValue()` | 同期的に値を返す |
| async関数（成功） | `mockResolvedValue()` | Promiseで値を返す |
| async関数（失敗） | `mockRejectedValue()` | Promiseでエラーを投げる |
| 呼び出しごとに変化 | `...Once()` を連鎖 | 柔軟な制御が可能 |

### クイックリファレンス

```typescript
// 同期
fn.mockReturnValue(value)

// 非同期成功
fn.mockResolvedValue(value)

// 非同期エラー
fn.mockRejectedValue(error)

// 1回だけ
fn.mockReturnValueOnce(value)
fn.mockResolvedValueOnce(value)
fn.mockRejectedValueOnce(error)
```

この3つのメソッドを正しく使い分けることで、あらゆるテストシナリオに対応できます！
