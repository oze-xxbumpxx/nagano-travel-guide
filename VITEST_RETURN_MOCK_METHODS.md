# mockReturnValue / mockResolvedValue / mockRejectedValue 使い方ガイド

## 目次
1. [3つのメソッドの違い](#3つのメソッドの違い)
2. [mockReturnValue() の使い方](#mockreturnvalue-の使い方)
3. [mockResolvedValue() の使い方](#mockresolvedvalue-の使い方)
4. [mockRejectedValue() の使い方](#mockrejectedvalue-の使い方)
5. [使い分けの判断基準](#使い分けの判断基準)
6. [実践的な組み合わせパターン](#実践的な組み合わせパターン)
7. [よくある質問](#よくある質問)

---

## 3つのメソッドの違い

### 一覧表

| メソッド | 用途 | 戻り値の型 | 使用場面 |
|---------|------|-----------|---------|
| `mockReturnValue(value)` | 同期的に値を返す | 任意の値 | 通常の関数 |
| `mockResolvedValue(value)` | Promiseを成功させる | Promise<value> | async関数、Promise |
| `mockRejectedValue(error)` | Promiseを失敗させる | Promise<error> | エラーケースのテスト |

### 視覚的な違い

```typescript
// 1. mockReturnValue - 即座に値を返す
const fn1 = vi.fn();
fn1.mockReturnValue(42);
const result1 = fn1(); // 42（すぐに取得）

// 2. mockResolvedValue - Promiseで値を返す（成功）
const fn2 = vi.fn();
fn2.mockResolvedValue(42);
const result2 = await fn2(); // 42（awaitが必要）

// 3. mockRejectedValue - Promiseでエラーを返す（失敗）
const fn3 = vi.fn();
fn3.mockRejectedValue(new Error('失敗'));
try {
  await fn3(); // エラーが投げられる
} catch (error) {
  console.log(error.message); // '失敗'
}
```

---

## mockReturnValue() の使い方

### 基本概念

`mockReturnValue(value)`は、モック関数が**同期的に**（すぐに）値を返すように設定します。通常の関数（非同期でない関数）のモックに使用します。

### 基本的な使い方

```typescript
import { vi } from 'vitest';

// モック関数を作成
const getName = vi.fn();

// 戻り値を設定
getName.mockReturnValue('田中太郎');

// 使用
const name = getName();
console.log(name); // '田中太郎'
```

### さまざまな値を返す例

**文字列を返す**
```typescript
const getMessage = vi.fn();
getMessage.mockReturnValue('こんにちは');

console.log(getMessage()); // 'こんにちは'
```

**数値を返す**
```typescript
const getAge = vi.fn();
getAge.mockReturnValue(30);

console.log(getAge()); // 30
```

**真偽値を返す**
```typescript
const isValid = vi.fn();
isValid.mockReturnValue(true);

console.log(isValid()); // true
```

**オブジェクトを返す**
```typescript
const getUser = vi.fn();
getUser.mockReturnValue({
  id: 1,
  name: '田中太郎',
  email: 'tanaka@example.com',
  age: 30,
});

const user = getUser();
console.log(user.name); // '田中太郎'
console.log(user.age);  // 30
```

**配列を返す**
```typescript
const getNumbers = vi.fn();
getNumbers.mockReturnValue([1, 2, 3, 4, 5]);

const numbers = getNumbers();
console.log(numbers.length); // 5
console.log(numbers[0]);     // 1
```

**null や undefined を返す**
```typescript
const findItem = vi.fn();

// nullを返す
findItem.mockReturnValue(null);
console.log(findItem()); // null

// undefinedを返す
findItem.mockReturnValue(undefined);
console.log(findItem()); // undefined
```

### 既存のメソッドをモック

```typescript
const calculator = {
  add: (a: number, b: number) => a + b,
  multiply: (a: number, b: number) => a * b,
};

// addメソッドの戻り値をモック
vi.spyOn(calculator, 'add').mockReturnValue(100);

console.log(calculator.add(2, 3));    // 100（実際の計算は無視される）
console.log(calculator.add(10, 20));  // 100（常に100）
console.log(calculator.multiply(2, 3)); // 6（モックされていないので通常動作）
```

### 実用例：計算関数のテスト

```typescript
// テスト対象の関数
function calculateDiscount(price: number, getDiscountRate: () => number) {
  const rate = getDiscountRate();
  return price * (1 - rate);
}

// テスト
it('割引率が適用される', () => {
  const getDiscountRate = vi.fn();
  getDiscountRate.mockReturnValue(0.2); // 20%割引

  const finalPrice = calculateDiscount(1000, getDiscountRate);

  expect(finalPrice).toBe(800);
  expect(getDiscountRate).toHaveBeenCalledTimes(1);
});
```

### 実用例：設定値の取得

```typescript
class ConfigService {
  getApiUrl(): string {
    // 実際は環境変数や設定ファイルから取得
    return process.env.API_URL || 'https://api.example.com';
  }
}

describe('ConfigService', () => {
  it('テスト用のAPIを返す', () => {
    const config = new ConfigService();
    vi.spyOn(config, 'getApiUrl').mockReturnValue('http://localhost:3000');

    expect(config.getApiUrl()).toBe('http://localhost:3000');
  });
});
```

### 重要なポイント

1. **同期的な値を返す**: `await`は不要です
2. **引数に関係なく同じ値**: どんな引数で呼んでも、設定した値を返します
3. **何度呼んでも同じ値**: 後から変更しない限り、常に同じ値が返されます

```typescript
const fn = vi.fn();
fn.mockReturnValue(42);

console.log(fn());           // 42
console.log(fn(1, 2, 3));    // 42（引数を無視）
console.log(fn('hello'));    // 42（引数の型も無視）
```

---

## mockResolvedValue() の使い方

### 基本概念

`mockResolvedValue(value)`は、モック関数が**Promise を成功させて**値を返すように設定します。非同期関数（async関数やPromiseを返す関数）のモックに使用します。

これは以下のコードの短縮形です：
```typescript
// これと同じ意味
fn.mockReturnValue(Promise.resolve(value));
```

### 基本的な使い方

```typescript
import { vi } from 'vitest';

// モック関数を作成
const fetchUser = vi.fn();

// Promiseで値を返すように設定
fetchUser.mockResolvedValue({
  id: 1,
  name: '田中太郎',
});

// 使用（awaitが必要）
const user = await fetchUser();
console.log(user.name); // '田中太郎'
```

### なぜ mockResolvedValue を使うのか

**理由1: 非同期関数のテストに必須**

実際のコードが非同期処理を行う場合、テストでもPromiseを返す必要があります：

```typescript
// 実際のコード（非同期）
async function getUserName(userId: number): Promise<string> {
  const response = await fetch(`/api/users/${userId}`);
  const user = await response.json();
  return user.name;
}

// テスト
it('ユーザー名を取得', async () => {
  // fetchをモック
  global.fetch = vi.fn();
  
  // Promiseで値を返す
  vi.mocked(fetch).mockResolvedValue({
    json: async () => ({ name: '田中太郎' }),
  } as Response);

  const name = await getUserName(1);
  expect(name).toBe('田中太郎');
});
```

**理由2: awaitの動作を正確に再現**

非同期処理を正しくテストするには、実際と同じようにawaitが機能する必要があります：

```typescript
const asyncFn = vi.fn();

// ❌ mockReturnValueだと問題が起きる
asyncFn.mockReturnValue({ data: 'test' });
const result1 = await asyncFn(); // { data: 'test' }（Promiseではない）

// ✅ mockResolvedValueが正しい
asyncFn.mockResolvedValue({ data: 'test' });
const result2 = await asyncFn(); // { data: 'test' }（Promiseから取得）
```

### さまざまなパターン

**API呼び出しのモック**
```typescript
import axios from 'axios';

vi.mock('axios');

it('ユーザーデータを取得', async () => {
  const mockUser = {
    id: 1,
    name: '田中太郎',
    email: 'tanaka@example.com',
  };

  // axios.getの戻り値をモック
  vi.mocked(axios.get).mockResolvedValue({
    data: mockUser,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });

  const response = await axios.get('/api/users/1');

  expect(response.data).toEqual(mockUser);
  expect(response.status).toBe(200);
});
```

**データベースクエリのモック**
```typescript
class UserRepository {
  async findById(id: number) {
    // 実際のDB接続
    return await db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

it('IDでユーザーを検索', async () => {
  const repository = new UserRepository();
  const mockUser = { id: 1, name: '田中太郎', email: 'tanaka@example.com' };

  vi.spyOn(repository, 'findById').mockResolvedValue(mockUser);

  const user = await repository.findById(1);

  expect(user).toEqual(mockUser);
  expect(repository.findById).toHaveBeenCalledWith(1);
});
```

**ファイル読み込みのモック**
```typescript
import fs from 'fs/promises';

vi.mock('fs/promises');

it('ファイルを読み込む', async () => {
  const fileContent = 'ファイルの内容';

  vi.mocked(fs.readFile).mockResolvedValue(fileContent);

  const content = await fs.readFile('test.txt', 'utf-8');

  expect(content).toBe(fileContent);
});
```

**複数の値を順番に返す**
```typescript
const fetchData = vi.fn();

fetchData
  .mockResolvedValueOnce({ page: 1, data: ['item1', 'item2'] })
  .mockResolvedValueOnce({ page: 2, data: ['item3', 'item4'] })
  .mockResolvedValueOnce({ page: 3, data: [] });

const page1 = await fetchData();
console.log(page1); // { page: 1, data: ['item1', 'item2'] }

const page2 = await fetchData();
console.log(page2); // { page: 2, data: ['item3', 'item4'] }

const page3 = await fetchData();
console.log(page3); // { page: 3, data: [] }
```

### 実用例：認証サービスのテスト

```typescript
interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
  };
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }
}

describe('AuthService', () => {
  it('ログイン成功', async () => {
    const authService = new AuthService();
    const mockResponse: LoginResponse = {
      token: 'abc123',
      user: { id: 1, name: '田中太郎' },
    };

    vi.spyOn(authService, 'login').mockResolvedValue(mockResponse);

    const result = await authService.login('test@example.com', 'password');

    expect(result.token).toBe('abc123');
    expect(result.user.name).toBe('田中太郎');
  });
});
```

### 重要なポイント

1. **awaitが必要**: Promiseを返すので、`await`または`.then()`を使用します
2. **async関数のモックに最適**: 非同期関数をテストする際の標準的な方法です
3. **テストが非同期になる**: テスト関数も`async`にする必要があります

```typescript
// ✅ 正しい使い方
it('非同期テスト', async () => {
  const fn = vi.fn();
  fn.mockResolvedValue({ data: 'test' });
  
  const result = await fn();
  expect(result.data).toBe('test');
});

// ❌ awaitを忘れると失敗する
it('間違った使い方', () => {
  const fn = vi.fn();
  fn.mockResolvedValue({ data: 'test' });
  
  const result = fn(); // Promiseオブジェクトが返る
  expect(result.data).toBe('test'); // エラー！
});
```

---

## mockRejectedValue() の使い方

### 基本概念

`mockRejectedValue(error)`は、モック関数が**Promise を失敗させて**エラーを投げるように設定します。エラーケースやエラーハンドリングのテストに使用します。

これは以下のコードの短縮形です：
```typescript
// これと同じ意味
fn.mockReturnValue(Promise.reject(error));
```

### 基本的な使い方

```typescript
import { vi } from 'vitest';

// モック関数を作成
const fetchUser = vi.fn();

// Promiseを失敗させる
fetchUser.mockRejectedValue(new Error('ユーザーが見つかりません'));

// 使用（エラーが投げられる）
try {
  await fetchUser(999);
} catch (error) {
  console.log(error.message); // 'ユーザーが見つかりません'
}

// またはexpectで検証
await expect(fetchUser(999)).rejects.toThrow('ユーザーが見つかりません');
```

### なぜ mockRejectedValue を使うのか

**理由1: エラーケースのテストに必須**

実際のアプリケーションでは、エラーが発生する可能性があります。これらのケースを正しくテストするには、エラーを発生させる必要があります：

```typescript
// 実際のコード
async function deleteUser(userId: number) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('削除に失敗しました');
  }
  
  return { success: true };
}

// エラーケースをテスト
it('削除失敗時はエラーを投げる', async () => {
  global.fetch = vi.fn();
  
  vi.mocked(fetch).mockResolvedValue({
    ok: false,
    status: 404,
  } as Response);

  await expect(deleteUser(999)).rejects.toThrow('削除に失敗しました');
});
```

**理由2: エラーハンドリングの検証**

try-catchやエラーハンドラーが正しく動作するかをテストできます：

```typescript
async function fetchWithErrorHandling(url: string) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('エラーが発生しました:', error);
    return { error: true, message: error.message };
  }
}

it('エラーハンドリングが動作', async () => {
  global.fetch = vi.fn();
  
  vi.mocked(fetch).mockRejectedValue(new Error('ネットワークエラー'));

  const result = await fetchWithErrorHandling('/api/data');

  expect(result.error).toBe(true);
  expect(result.message).toBe('ネットワークエラー');
});
```

### さまざまなエラーパターン

**標準的なErrorオブジェクト**
```typescript
const apiCall = vi.fn();
apiCall.mockRejectedValue(new Error('API呼び出しに失敗しました'));

await expect(apiCall()).rejects.toThrow('API呼び出しに失敗しました');
```

**カスタムエラークラス**
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiCall = vi.fn();
apiCall.mockRejectedValue(
  new ApiError('認証エラー', 401, 'UNAUTHORIZED')
);

try {
  await apiCall();
} catch (error) {
  expect(error).toBeInstanceOf(ApiError);
  expect((error as ApiError).statusCode).toBe(401);
  expect((error as ApiError).code).toBe('UNAUTHORIZED');
}
```

**HTTPエラーレスポンス**
```typescript
import axios from 'axios';

vi.mock('axios');

it('404エラー', async () => {
  const errorResponse = {
    response: {
      status: 404,
      statusText: 'Not Found',
      data: { message: 'ユーザーが見つかりません' },
    },
  };

  vi.mocked(axios.get).mockRejectedValue(errorResponse);

  try {
    await axios.get('/api/users/999');
  } catch (error: any) {
    expect(error.response.status).toBe(404);
    expect(error.response.data.message).toBe('ユーザーが見つかりません');
  }
});
```

**文字列エラー（推奨されませんが可能）**
```typescript
const fn = vi.fn();
fn.mockRejectedValue('エラーメッセージ');

await expect(fn()).rejects.toBe('エラーメッセージ');
```

### 成功とエラーを組み合わせる

```typescript
const apiCall = vi.fn();

// 1回目: 成功
// 2回目: エラー
// 3回目: 成功
apiCall
  .mockResolvedValueOnce({ data: 'success' })
  .mockRejectedValueOnce(new Error('一時的なエラー'))
  .mockResolvedValueOnce({ data: 'success again' });

// 1回目: 成功
const result1 = await apiCall();
expect(result1.data).toBe('success');

// 2回目: エラー
await expect(apiCall()).rejects.toThrow('一時的なエラー');

// 3回目: 成功
const result3 = await apiCall();
expect(result3.data).toBe('success again');
```

### 実用例：リトライロジックのテスト

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error; // 最後のリトライで失敗したら投げる
      }
      // 次のリトライまで待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

describe('リトライロジック', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  it('2回失敗した後、3回目で成功', async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('ネットワークエラー'))
      .mockRejectedValueOnce(new Error('ネットワークエラー'))
      .mockResolvedValueOnce({
        json: async () => ({ data: 'success' }),
      } as Response);

    const promise = fetchWithRetry('/api/data');
    
    // タイマーを進める
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(result.data).toBe('success');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('すべて失敗するとエラーを投げる', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('ネットワークエラー'));

    const promise = fetchWithRetry('/api/data', 3);
    
    await vi.advanceTimersByTimeAsync(3000);

    await expect(promise).rejects.toThrow('ネットワークエラー');
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
```

### 実用例：バリデーションエラーのテスト

```typescript
class UserService {
  async createUser(userData: { name: string; email: string }) {
    if (!userData.name || !userData.email) {
      throw new Error('名前とメールアドレスは必須です');
    }

    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response.json();
  }
}

describe('UserService', () => {
  it('バリデーションエラー', async () => {
    const service = new UserService();

    // バリデーションエラーが発生することを期待
    await expect(
      service.createUser({ name: '', email: '' })
    ).rejects.toThrow('名前とメールアドレスは必須です');
  });

  it('API呼び出しエラー', async () => {
    const service = new UserService();
    global.fetch = vi.fn();

    vi.mocked(fetch).mockRejectedValue(new Error('サーバーエラー'));

    await expect(
      service.createUser({ name: 'Test', email: 'test@example.com' })
    ).rejects.toThrow('サーバーエラー');
  });
});
```

### 重要なポイント

1. **エラーハンドリングのテストに必須**: try-catchやエラーハンドラーの動作確認
2. **expect().rejects を使用**: エラーを検証する際の標準的な方法
3. **実際のErrorオブジェクトを推奨**: デバッグが容易になります

```typescript
// ✅ 推奨：Errorオブジェクトを使用
fn.mockRejectedValue(new Error('エラーメッセージ'));

// ⚠️ 可能だが推奨されない：文字列
fn.mockRejectedValue('エラー');

// ✅ カスタムエラークラスも使用可能
fn.mockRejectedValue(new CustomError('エラー', 404));
```

---

## 使い分けの判断基準

### フローチャート

```
テスト対象の関数は非同期？
  ├─ いいえ → mockReturnValue() を使用
  │
  └─ はい
      │
      成功ケースをテスト？
      ├─ はい → mockResolvedValue() を使用
      │
      └─ いいえ（エラーケース）→ mockRejectedValue() を使用
```

### 具体的な判断基準

**mockReturnValue() を使う場合**
- ✅ 通常の関数（非同期でない）
- ✅ 即座に値を返す関数
- ✅ コールバック関数
- ✅ 計算結果を返す関数
- ✅ 設定値を返す関数

```typescript
// これらはmockReturnValueを使う
const getName = vi.fn();
const calculate = vi.fn();
const isValid = vi.fn();
const getConfig = vi.fn();
```

**mockResolvedValue() を使う場合**
- ✅ async関数
- ✅ Promiseを返す関数
- ✅ API呼び出し（成功ケース）
- ✅ データベースクエリ（成功ケース）
- ✅ ファイルI/O（成功ケース）

```typescript
// これらはmockResolvedValueを使う
const fetchData = vi.fn();
const saveUser = vi.fn();
const readFile = vi.fn();
```

**mockRejectedValue() を使う場合**
- ✅ エラーケースのテスト
- ✅ 失敗する可能性のある処理
- ✅ エラーハンドリングの検証
- ✅ リトライロジックのテスト
- ✅ バリデーションエラー

```typescript
// これらはmockRejectedValueを使う
const fetchDataWithError = vi.fn();
const failedValidation = vi.fn();
```

### 実際のコード例で比較

**元の関数**
```typescript
// 同期関数
function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

// 非同期関数（成功）
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// 非同期関数（エラーの可能性）
async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('削除に失敗');
  }
}
```

**対応するモック**
```typescript
// 同期関数 → mockReturnValue
const mockGetFullName = vi.fn();
mockGetFullName.mockReturnValue('田中 太郎');

// 非同期関数（成功）→ mockResolvedValue
const mockFetchUser = vi.fn();
mockFetchUser.mockResolvedValue({ id: 1, name: '田中太郎' });

// 非同期関数（エラー）→ mockRejectedValue
const mockDeleteUser = vi.fn();
mockDeleteUser.mockRejectedValue(new Error('削除に失敗'));
```

---

## 実践的な組み合わせパターン

### パターン1: APIクライアントの完全なテスト

```typescript
class ApiClient {
  async get(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('GET failed');
    return response.json();
  }

  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('POST failed');
    return response.json();
  }
}

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
    global.fetch = vi.fn();
  });

  // 成功ケース - mockResolvedValue
  it('GET成功', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'success' }),
    } as Response);

    const result = await client.get('/api/data');
    expect(result.data).toBe('success');
  });

  // エラーケース - mockRejectedValue
  it('GET失敗', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(client.get('/api/data')).rejects.toThrow('GET failed');
  });

  // 成功ケース - mockResolvedValue
  it('POST成功', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: 'Created' }),
    } as Response);

    const result = await client.post('/api/data', { name: 'New' });
    expect(result.id).toBe(1);
  });
});
```

### パターン2: 条件に応じて成功とエラーを切り替え

```typescript
const apiCall = vi.fn();

apiCall.mockImplementation(async (userId: number) => {
  // 特定のIDではエラーを返す
  if (userId === 999) {
    throw new Error('ユーザーが見つかりません');
  }

  // 管理者
  if (userId === 1) {
    return { id: 1, name: '管理者', role: 'admin' };
  }

  // 通常のユーザー
  return { id: userId, name: `ユーザー${userId}`, role: 'user' };
});

// テスト
const admin = await apiCall(1);
expect(admin.role).toBe('admin');

const user = await apiCall(5);
expect(user.role).toBe('user');

await expect(apiCall(999)).rejects.toThrow('ユーザーが見つかりません');
```

### パターン3: リトライ付きAPI呼び出し

```typescript
async function apiCallWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

describe('リトライ機能', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  it('1回目エラー、2回目成功', async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Network error'))  // 1回目: エラー
      .mockResolvedValueOnce({ ok: true } as Response);   // 2回目: 成功

    const promise = apiCallWithRetry('/api/data');
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

### パターン4: 段階的なデータ取得

```typescript
class DataLoader {
  loadStatus = vi.fn();

  constructor() {
    let step = 0;

    this.loadStatus.mockImplementation(() => {
      step++;
      
      // ステップ1-2: ローディング中
      if (step <= 2) {
        return { loading: true, data: null };
      }
      
      // ステップ3: データ取得完了
      return { loading: false, data: 'Loaded successfully' };
    });
  }
}

it('段階的なデータ取得', () => {
  const loader = new DataLoader();

  expect(loader.loadStatus()).toEqual({ loading: true, data: null });
  expect(loader.loadStatus()).toEqual({ loading: true, data: null });
  expect(loader.loadStatus()).toEqual({ loading: false, data: 'Loaded successfully' });
});
```

---

## よくある質問

### Q1: mockReturnValue と mockResolvedValue の違いは？

**A:** 戻り値がPromiseかどうかの違いです。

```typescript
// mockReturnValue: 即座に値を返す（Promiseではない）
const fn1 = vi.fn().mockReturnValue(42);
console.log(fn1());        // 42
console.log(await fn1());  // 42（awaitは不要だが使っても問題ない）

// mockResolvedValue: Promiseで値を返す
const fn2 = vi.fn().mockResolvedValue(42);
console.log(fn2());        // Promise { <pending> }
console.log(await fn2());  // 42（awaitが必要）
```

### Q2: 非同期関数に mockReturnValue を使うとどうなる？

**A:** 動作はしますが、Promiseではなく値が直接返されるため、正しいテストになりません。

```typescript
const asyncFn = vi.fn();

// ❌ 間違い：Promiseを期待しているのに値が返る
asyncFn.mockReturnValue({ data: 'test' });
const result = await asyncFn(); // { data: 'test' }（動くが正しくない）

// ✅ 正しい：Promiseで値が返る
asyncFn.mockResolvedValue({ data: 'test' });
const result = await asyncFn(); // { data: 'test' }（正しい）
```

### Q3: エラーを投げる同期関数はどうモックする？

**A:** `mockImplementation()`を使って throw します。`mockRejectedValue()`は非同期専用です。

```typescript
// 同期関数でエラーを投げる
const syncFn = vi.fn();

// ❌ mockRejectedValueは使えない（非同期用）
syncFn.mockRejectedValue(new Error('Error'));

// ✅ mockImplementationを使う
syncFn.mockImplementation(() => {
  throw new Error('Error');
});

// または
syncFn.mockReturnValue((() => { throw new Error('Error'); })());
```

### Q4: 複数回呼び出される関数で、最初だけエラーにしたい

**A:** `mockRejectedValueOnce()`と`mockResolvedValue()`を組み合わせます。

```typescript
const apiCall = vi.fn();

apiCall
  .mockRejectedValueOnce(new Error('First call fails'))
  .mockResolvedValue({ success: true });

// 1回目: エラー
await expect(apiCall()).rejects.toThrow('First call fails');

// 2回目以降: 成功
const result = await apiCall();
expect(result.success).toBe(true);
```

### Q5: mockReturnValue を設定した後、変更できる？

**A:** はい、再度呼び出すことで上書きできます。

```typescript
const fn = vi.fn();

fn.mockReturnValue('first');
console.log(fn()); // 'first'

fn.mockReturnValue('second');
console.log(fn()); // 'second'
```

### Q6: オブジェクトを返す時、毎回同じインスタンス？

**A:** はい、同じ参照が返されます。毎回新しいインスタンスが必要な場合は`mockImplementation()`を使います。

```typescript
// 同じインスタンスが返る
const fn1 = vi.fn();
fn1.mockReturnValue({ id: 1 });

const a = fn1();
const b = fn1();
console.log(a === b); // true

// 毎回新しいインスタンスを返す
const fn2 = vi.fn();
fn2.mockImplementation(() => ({ id: 1 }));

const c = fn2();
const d = fn2();
console.log(c === d); // false
```

### Q7: TypeScriptで型エラーが出る場合は？

**A:** `vi.mocked()`を使用するか、型を明示します。

```typescript
import axios from 'axios';

// ❌ 型エラーになる可能性
axios.get.mockResolvedValue({ data: {} });

// ✅ vi.mocked()を使用
vi.mocked(axios.get).mockResolvedValue({ data: {} });

// ✅ 型を明示
(axios.get as any).mockResolvedValue({ data: {} });
```

---

## まとめ

### クイックリファレンス

```typescript
// 同期的に値を返す
fn.mockReturnValue(value)          // 常に同じ値
fn.mockReturnValueOnce(value)      // 1回だけ特定の値

// 非同期で成功
fn.mockResolvedValue(value)        // 常に同じ値で成功
fn.mockResolvedValueOnce(value)    // 1回だけ成功

// 非同期でエラー
fn.mockRejectedValue(error)        // 常にエラー
fn.mockRejectedValueOnce(error)    // 1回だけエラー
```

### 選択ガイド

| 状況 | 使用するメソッド |
|------|----------------|
| 通常の関数 | `mockReturnValue()` |
| async関数（成功） | `mockResolvedValue()` |
| async関数（失敗） | `mockRejectedValue()` |
| 呼び出しごとに変化 | `...Once()`を連鎖 |
| 複雑なロジック | `mockImplementation()` |

この3つのメソッドを使い分けることで、あらゆるテストシナリオに対応できます！
