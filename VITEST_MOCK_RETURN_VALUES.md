# Vitest 戻り値のモック化 完全ガイド

## 目次
1. [基本的な戻り値のモック](#基本的な戻り値のモック)
2. [同期関数の戻り値モック](#同期関数の戻り値モック)
3. [非同期関数の戻り値モック](#非同期関数の戻り値モック)
4. [複数回の呼び出しで異なる値を返す](#複数回の呼び出しで異なる値を返す)
5. [条件分岐による戻り値の制御](#条件分岐による戻り値の制御)
6. [カスタム実装によるモック](#カスタム実装によるモック)
7. [実践的なパターン集](#実践的なパターン集)
8. [よくあるエラーと解決策](#よくあるエラーと解決策)

---

## 基本的な戻り値のモック

### mockReturnValue() - 固定値を返す

最もシンプルな戻り値のモック方法は、`mockReturnValue()`を使用することです。

```typescript
import { vi } from 'vitest';

const mockFunction = vi.fn();

// 常に42を返すようにモック
mockFunction.mockReturnValue(42);

console.log(mockFunction()); // 42
console.log(mockFunction()); // 42
console.log(mockFunction()); // 42
```

**重要なポイント**:
- `mockReturnValue()`で設定した値は、関数が何回呼ばれても同じ値を返します
- 引数に関係なく、常に同じ値が返されます
- 後から別の値に変更することも可能です

### 既存の関数の戻り値をモック

`vi.spyOn()`を使用して、既存のオブジェクトのメソッドの戻り値をモックできます：

```typescript
const calculator = {
  add: (a: number, b: number) => a + b,
  multiply: (a: number, b: number) => a * b,
};

// addメソッドの戻り値をモック
const spy = vi.spyOn(calculator, 'add').mockReturnValue(100);

console.log(calculator.add(2, 3)); // 100（実際の計算は行われない）
console.log(calculator.add(10, 20)); // 100
```

この例では、実際の計算（2 + 3 = 5）は行われず、常に100が返されます。

---

## 同期関数の戻り値モック

### mockReturnValue() - 基本的な使い方

```typescript
const getUserName = vi.fn();
getUserName.mockReturnValue('田中太郎');

const name = getUserName();
console.log(name); // '田中太郎'
```

### 複雑なオブジェクトを返す

オブジェクトや配列などの複雑な値も返せます：

```typescript
const getUser = vi.fn();

getUser.mockReturnValue({
  id: 1,
  name: '田中太郎',
  email: 'tanaka@example.com',
  age: 30,
  roles: ['user', 'admin'],
});

const user = getUser();
console.log(user.name); // '田中太郎'
console.log(user.roles); // ['user', 'admin']
```

### 配列を返す

```typescript
const getUsers = vi.fn();

getUsers.mockReturnValue([
  { id: 1, name: '田中太郎' },
  { id: 2, name: '佐藤花子' },
  { id: 3, name: '鈴木一郎' },
]);

const users = getUsers();
console.log(users.length); // 3
console.log(users[0].name); // '田中太郎'
```

### undefined または null を返す

```typescript
const findUser = vi.fn();

// undefinedを返す
findUser.mockReturnValue(undefined);
console.log(findUser()); // undefined

// nullを返す
findUser.mockReturnValue(null);
console.log(findUser()); // null
```

### this を使用する関数のモック

```typescript
const obj = {
  value: 0,
  increment: function() {
    return ++this.value;
  },
};

// incrementメソッドをモック
vi.spyOn(obj, 'increment').mockReturnValue(999);

console.log(obj.increment()); // 999（実際のインクリメントは行われない）
```

---

## 非同期関数の戻り値モック

### mockResolvedValue() - Promise を成功させる

非同期関数（Promise を返す関数）をモックする場合は、`mockResolvedValue()`を使用します：

```typescript
const fetchUser = vi.fn();

// Promiseが成功して、ユーザーデータを返す
fetchUser.mockResolvedValue({
  id: 1,
  name: '田中太郎',
  email: 'tanaka@example.com',
});

// 使用例
const user = await fetchUser(1);
console.log(user.name); // '田中太郎'
```

**なぜ mockResolvedValue() を使うのか**:

`mockResolvedValue()`は、以下のコードの短縮形です：

```typescript
// これと同じ意味
fetchUser.mockReturnValue(Promise.resolve({
  id: 1,
  name: '田中太郎',
}));
```

`mockResolvedValue()`を使う方が簡潔で読みやすいため、非同期関数のモックでは推奨されます。

### mockRejectedValue() - Promise を失敗させる

エラーケースをテストする場合は、`mockRejectedValue()`を使用します：

```typescript
const fetchUser = vi.fn();

// Promiseが失敗して、エラーを返す
fetchUser.mockRejectedValue(new Error('ユーザーが見つかりません'));

// 使用例
try {
  await fetchUser(999);
} catch (error) {
  console.log(error.message); // 'ユーザーが見つかりません'
}

// またはexpectで検証
await expect(fetchUser(999)).rejects.toThrow('ユーザーが見つかりません');
```

### カスタムエラーオブジェクトを返す

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
  if (error instanceof ApiError) {
    console.log(error.statusCode); // 401
    console.log(error.code); // 'UNAUTHORIZED'
  }
}
```

### 非同期関数の実践例

**例1: API呼び出しのモック**

```typescript
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');

describe('ユーザーAPI', () => {
  it('ユーザー情報を取得する', async () => {
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
      config: {},
    });

    const response = await axios.get('/api/users/1');
    
    expect(response.data).toEqual(mockUser);
    expect(axios.get).toHaveBeenCalledWith('/api/users/1');
  });

  it('ユーザーが存在しない場合', async () => {
    // 404エラーをモック
    vi.mocked(axios.get).mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'ユーザーが見つかりません' },
      },
    });

    await expect(axios.get('/api/users/999')).rejects.toMatchObject({
      response: {
        status: 404,
      },
    });
  });
});
```

**例2: データベースクエリのモック**

```typescript
class UserRepository {
  async findById(id: number) {
    // 実際のDB接続コード
    return db.query('SELECT * FROM users WHERE id = ?', [id]);
  }

  async save(user: User) {
    // 実際のDB保存コード
    return db.insert('users', user);
  }
}

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
  });

  it('IDでユーザーを検索', async () => {
    const mockUser = { id: 1, name: '田中太郎' };

    // findByIdメソッドをモック
    vi.spyOn(repository, 'findById').mockResolvedValue(mockUser);

    const user = await repository.findById(1);

    expect(user).toEqual(mockUser);
  });

  it('ユーザーを保存', async () => {
    const newUser = { name: '佐藤花子', email: 'sato@example.com' };
    const savedUser = { id: 2, ...newUser };

    vi.spyOn(repository, 'save').mockResolvedValue(savedUser);

    const result = await repository.save(newUser);

    expect(result.id).toBe(2);
    expect(result.name).toBe('佐藤花子');
  });
});
```

---

## 複数回の呼び出しで異なる値を返す

### mockReturnValueOnce() - 1回だけ特定の値を返す

`mockReturnValueOnce()`を使用すると、呼び出しごとに異なる値を返すことができます：

```typescript
const random = vi.fn();

random
  .mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValueOnce(3)
  .mockReturnValue(0); // 4回目以降はすべて0

console.log(random()); // 1
console.log(random()); // 2
console.log(random()); // 3
console.log(random()); // 0
console.log(random()); // 0
```

**チェーンの仕組み**:
- `mockReturnValueOnce()`は、次に呼ばれた時だけ指定した値を返します
- 複数の`mockReturnValueOnce()`をチェーンすると、順番に値が返されます
- すべての`Once`が消費された後は、`mockReturnValue()`で設定した値が返されます
- `mockReturnValue()`がない場合は、`undefined`が返されます

### mockResolvedValueOnce() - 非同期で1回だけ

非同期関数でも同様に、呼び出しごとに異なる値を返せます：

```typescript
const fetchData = vi.fn();

fetchData
  .mockResolvedValueOnce({ page: 1, data: ['item1', 'item2'] })
  .mockResolvedValueOnce({ page: 2, data: ['item3', 'item4'] })
  .mockResolvedValueOnce({ page: 3, data: [] }); // データがない

const page1 = await fetchData();
console.log(page1); // { page: 1, data: ['item1', 'item2'] }

const page2 = await fetchData();
console.log(page2); // { page: 2, data: ['item3', 'item4'] }

const page3 = await fetchData();
console.log(page3); // { page: 3, data: [] }
```

### 成功とエラーを混在させる

```typescript
const apiCall = vi.fn();

apiCall
  .mockResolvedValueOnce({ success: true, data: 'first' })
  .mockRejectedValueOnce(new Error('一時的なエラー'))
  .mockResolvedValueOnce({ success: true, data: 'second' });

// 1回目: 成功
const result1 = await apiCall();
console.log(result1); // { success: true, data: 'first' }

// 2回目: エラー
try {
  await apiCall();
} catch (error) {
  console.log(error.message); // '一時的なエラー'
}

// 3回目: 成功
const result3 = await apiCall();
console.log(result3); // { success: true, data: 'second' }
```

### 実践例: リトライロジックのテスト

リトライ機能をテストする際、最初の数回は失敗させ、最後に成功させることができます：

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  it('2回失敗した後、3回目で成功', async () => {
    const mockData = { id: 1, name: 'Success' };

    // 1回目と2回目は失敗、3回目は成功
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

    const promise = fetchWithRetry('/api/data');

    // タイマーを進める（リトライの待機時間）
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
```

### 実践例: ページネーションのテスト

```typescript
class PaginatedApi {
  async fetchPage(pageNumber: number) {
    const response = await fetch(`/api/items?page=${pageNumber}`);
    return response.json();
  }

  async fetchAllPages() {
    const allItems = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await this.fetchPage(page);
      allItems.push(...result.items);
      hasMore = result.hasMore;
      page++;
    }

    return allItems;
  }
}

describe('PaginatedApi', () => {
  it('すべてのページを取得', async () => {
    const api = new PaginatedApi();

    // 各ページで異なるデータを返す
    vi.spyOn(api, 'fetchPage')
      .mockResolvedValueOnce({
        items: ['item1', 'item2'],
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: ['item3', 'item4'],
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: ['item5'],
        hasMore: false,
      });

    const allItems = await api.fetchAllPages();

    expect(allItems).toEqual(['item1', 'item2', 'item3', 'item4', 'item5']);
    expect(api.fetchPage).toHaveBeenCalledTimes(3);
  });
});
```

---

## 条件分岐による戻り値の制御

### mockImplementation() - 引数に応じて戻り値を変える

`mockImplementation()`を使用すると、引数に基づいて異なる値を返すことができます：

```typescript
const calculate = vi.fn();

calculate.mockImplementation((operation, a, b) => {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      return b !== 0 ? a / b : null;
    default:
      throw new Error('Unknown operation');
  }
});

console.log(calculate('add', 5, 3)); // 8
console.log(calculate('multiply', 5, 3)); // 15
console.log(calculate('divide', 10, 2)); // 5
console.log(calculate('divide', 10, 0)); // null
```

### 非同期のmockImplementation

```typescript
const fetchUser = vi.fn();

fetchUser.mockImplementation(async (userId) => {
  // ユーザーIDが存在しない場合
  if (userId > 1000) {
    throw new Error('ユーザーが見つかりません');
  }

  // 特定のIDで特別なユーザーを返す
  if (userId === 1) {
    return {
      id: 1,
      name: '管理者',
      role: 'admin',
    };
  }

  // 通常のユーザー
  return {
    id: userId,
    name: `ユーザー${userId}`,
    role: 'user',
  };
});

// 使用例
const admin = await fetchUser(1);
console.log(admin.role); // 'admin'

const user = await fetchUser(5);
console.log(user.name); // 'ユーザー5'

try {
  await fetchUser(9999);
} catch (error) {
  console.log(error.message); // 'ユーザーが見つかりません'
}
```

### 複雑な条件分岐の例

```typescript
const apiClient = vi.fn();

apiClient.mockImplementation(async (method, url, data) => {
  // GETリクエスト
  if (method === 'GET') {
    if (url.includes('/users')) {
      const userId = url.split('/').pop();
      return { data: { id: userId, name: `User ${userId}` } };
    }
    if (url.includes('/posts')) {
      return { data: [{ id: 1, title: 'Post 1' }] };
    }
  }

  // POSTリクエスト
  if (method === 'POST') {
    if (url.includes('/users')) {
      return { data: { id: 999, ...data }, status: 201 };
    }
  }

  // DELETEリクエスト
  if (method === 'DELETE') {
    return { status: 204 };
  }

  // それ以外
  throw new Error(`Unexpected request: ${method} ${url}`);
});

// 使用例
const user = await apiClient('GET', '/api/users/123');
console.log(user.data); // { id: '123', name: 'User 123' }

const newUser = await apiClient('POST', '/api/users', {
  name: '新規ユーザー',
});
console.log(newUser.status); // 201
```

### mockImplementationOnce() - 1回だけカスタム実装

```typescript
const greet = vi.fn();

greet
  .mockImplementationOnce((name) => `こんにちは、${name}さん！`)
  .mockImplementationOnce((name) => `Hello, ${name}!`)
  .mockImplementation((name) => `Hi, ${name}`);

console.log(greet('太郎')); // 'こんにちは、太郎さん！'
console.log(greet('Taro')); // 'Hello, Taro!'
console.log(greet('田中')); // 'Hi, 田中'
console.log(greet('Tanaka')); // 'Hi, Tanaka'
```

---

## カスタム実装によるモック

### 元の実装を呼び出す

スパイで元の実装を保持しながら、特定の条件でモックすることもできます：

```typescript
const obj = {
  getValue(x: number) {
    return x * 2;
  },
};

const spy = vi.spyOn(obj, 'getValue');

spy.mockImplementation((x) => {
  // 特定の条件では元の実装を呼ぶ
  if (x < 10) {
    return spy.getMockImplementation()?.call(obj, x) ?? x * 2;
  }
  // それ以外はモック値
  return 999;
});

console.log(obj.getValue(5)); // 10（元の実装）
console.log(obj.getValue(15)); // 999（モック）
```

より簡単な方法として、`vi.importActual()`を使用：

```typescript
vi.mock('./calculator', async () => {
  const actual = await vi.importActual('./calculator');
  return {
    ...actual,
    add: vi.fn().mockImplementation((a, b) => {
      // 特定の条件でだけモック
      if (a === 0 || b === 0) {
        return 0;
      }
      // それ以外は実際の実装を使用
      return actual.add(a, b);
    }),
  };
});
```

### 状態を持つモック

モック関数内で状態を保持することもできます：

```typescript
const createCounter = () => {
  let count = 0;
  
  const counter = vi.fn();
  counter.mockImplementation(() => {
    return ++count;
  });
  
  return counter;
};

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

**実践例: レート制限のシミュレーション**

```typescript
const createRateLimitedApi = (maxCalls: number, resetInterval: number) => {
  let callCount = 0;
  let resetTime = Date.now() + resetInterval;

  const apiCall = vi.fn();

  apiCall.mockImplementation(async () => {
    const now = Date.now();

    // リセット時間を過ぎていたらカウンターをリセット
    if (now >= resetTime) {
      callCount = 0;
      resetTime = now + resetInterval;
    }

    // レート制限を超えている
    if (callCount >= maxCalls) {
      throw new Error('Rate limit exceeded');
    }

    callCount++;
    return { success: true, data: 'API response' };
  });

  return apiCall;
};

describe('レート制限', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('制限を超えるとエラー', async () => {
    const api = createRateLimitedApi(3, 60000); // 1分間に3回まで

    // 3回は成功
    await api();
    await api();
    await api();

    // 4回目はエラー
    await expect(api()).rejects.toThrow('Rate limit exceeded');

    // 1分経過後は再び成功
    vi.advanceTimersByTime(60000);
    const result = await api();
    expect(result.success).toBe(true);
  });
});
```

### スパイの呼び出し履歴に基づく動作

```typescript
const fetchData = vi.fn();

fetchData.mockImplementation(function(...args) {
  const callCount = this.mock.calls.length;

  // 最初の2回はローディング状態
  if (callCount <= 2) {
    return { loading: true, data: null };
  }

  // 3回目以降はデータを返す
  return { loading: false, data: 'Loaded data' };
});

console.log(fetchData()); // { loading: true, data: null }
console.log(fetchData()); // { loading: true, data: null }
console.log(fetchData()); // { loading: false, data: 'Loaded data' }
```

---

## 実践的なパターン集

### パターン1: ファクトリー関数でモックデータを生成

```typescript
// テストヘルパー
function createMockUser(overrides = {}) {
  return {
    id: 1,
    name: '田中太郎',
    email: 'tanaka@example.com',
    age: 30,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// 使用例
const fetchUser = vi.fn();

it('通常のユーザー', async () => {
  fetchUser.mockResolvedValue(createMockUser());
  const user = await fetchUser(1);
  expect(user.name).toBe('田中太郎');
});

it('管理者ユーザー', async () => {
  fetchUser.mockResolvedValue(createMockUser({
    name: '管理者',
    role: 'admin',
  }));
  const user = await fetchUser(1);
  expect(user.role).toBe('admin');
});
```

### パターン2: ビルダーパターンでモックを構築

```typescript
class MockResponseBuilder {
  private status = 200;
  private data: any = {};
  private headers: Record<string, string> = {};

  withStatus(status: number) {
    this.status = status;
    return this;
  }

  withData(data: any) {
    this.data = data;
    return this;
  }

  withHeader(key: string, value: string) {
    this.headers[key] = value;
    return this;
  }

  build() {
    return {
      status: this.status,
      data: this.data,
      headers: this.headers,
      ok: this.status >= 200 && this.status < 300,
    };
  }
}

// 使用例
const apiCall = vi.fn();

it('成功レスポンス', async () => {
  const response = new MockResponseBuilder()
    .withStatus(200)
    .withData({ id: 1, name: 'Test' })
    .withHeader('Content-Type', 'application/json')
    .build();

  apiCall.mockResolvedValue(response);

  const result = await apiCall();
  expect(result.ok).toBe(true);
  expect(result.data.name).toBe('Test');
});

it('エラーレスポンス', async () => {
  const response = new MockResponseBuilder()
    .withStatus(404)
    .withData({ error: 'Not found' })
    .build();

  apiCall.mockResolvedValue(response);

  const result = await apiCall();
  expect(result.ok).toBe(false);
});
```

### パターン3: 時系列データのモック

```typescript
function createTimeSeriesData(count: number, startDate: Date) {
  const data = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toISOString(),
      value: Math.random() * 100,
    });
  }
  return data;
}

const fetchAnalytics = vi.fn();

it('過去7日間のデータ', async () => {
  const startDate = new Date('2024-01-01');
  const mockData = createTimeSeriesData(7, startDate);

  fetchAnalytics.mockResolvedValue(mockData);

  const data = await fetchAnalytics();
  expect(data).toHaveLength(7);
  expect(data[0].date).toContain('2024-01-01');
});
```

### パターン4: ストリームやイベントのモック

```typescript
const eventEmitter = vi.fn();

eventEmitter.mockImplementation((eventName, callback) => {
  // イベント登録を記録
  if (eventName === 'data') {
    // 非同期でデータイベントを発火
    setTimeout(() => {
      callback({ data: 'chunk1' });
      callback({ data: 'chunk2' });
      callback({ data: 'chunk3' });
    }, 0);
  }

  if (eventName === 'end') {
    setTimeout(() => callback(), 100);
  }
});

it('ストリームデータを受信', (done) => {
  const chunks: string[] = [];

  eventEmitter('data', (chunk: any) => {
    chunks.push(chunk.data);
  });

  eventEmitter('end', () => {
    expect(chunks).toEqual(['chunk1', 'chunk2', 'chunk3']);
    done();
  });
});
```

### パターン5: キャッシュのモック

```typescript
class MockCache {
  private cache = new Map<string, any>();

  get = vi.fn().mockImplementation((key: string) => {
    return this.cache.get(key);
  });

  set = vi.fn().mockImplementation((key: string, value: any) => {
    this.cache.set(key, value);
  });

  has = vi.fn().mockImplementation((key: string) => {
    return this.cache.has(key);
  });

  clear = vi.fn().mockImplementation(() => {
    this.cache.clear();
  });
}

describe('キャッシュを使用する関数', () => {
  let cache: MockCache;

  beforeEach(() => {
    cache = new MockCache();
  });

  it('キャッシュヒット時はAPIを呼ばない', async () => {
    const apiCall = vi.fn().mockResolvedValue({ data: 'from API' });

    // キャッシュに値を設定
    cache.set('user:1', { data: 'from cache' });

    // キャッシュから取得
    const cached = cache.get('user:1');

    if (!cached) {
      await apiCall();
    }

    expect(cache.get).toHaveBeenCalledWith('user:1');
    expect(apiCall).not.toHaveBeenCalled();
  });
});
```

---

## よくあるエラーと解決策

### エラー1: TypeError: mockReturnValue is not a function

**原因**: 通常の関数に対して`mockReturnValue()`を呼ぼうとしている

```typescript
// ❌ エラー
function myFunction() {
  return 'hello';
}
myFunction.mockReturnValue('bye'); // エラー！
```

**解決策**: `vi.fn()`または`vi.spyOn()`を使用する

```typescript
// ✅ 正しい方法1: vi.fn()
const myFunction = vi.fn();
myFunction.mockReturnValue('bye');

// ✅ 正しい方法2: vi.spyOn()
const obj = {
  myFunction() {
    return 'hello';
  },
};
vi.spyOn(obj, 'myFunction').mockReturnValue('bye');
```

### エラー2: Promise が解決されない

**原因**: `mockReturnValue()`を使用して Promise を返そうとしている

```typescript
// ❌ 動くが推奨されない
fetchData.mockReturnValue(Promise.resolve({ data: 'test' }));
```

**解決策**: `mockResolvedValue()`を使用する

```typescript
// ✅ 正しい方法
fetchData.mockResolvedValue({ data: 'test' });
```

### エラー3: mockReturnValueOnce() が期待通りに動作しない

**問題**: 最初の呼び出しで設定した値が返らない

```typescript
const fn = vi.fn();
fn.mockReturnValue(0);
fn.mockReturnValueOnce(1); // これは無視される

console.log(fn()); // 0（期待は1）
```

**原因**: `mockReturnValue()`を先に呼んでいる

**解決策**: `mockReturnValueOnce()`を先に呼ぶか、正しい順序でチェーンする

```typescript
// ✅ 正しい方法
const fn = vi.fn();
fn.mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValue(0);

console.log(fn()); // 1
console.log(fn()); // 2
console.log(fn()); // 0
```

### エラー4: TypeScript の型エラー

**問題**: モック関数の戻り値の型が合わない

```typescript
interface User {
  id: number;
  name: string;
}

const fetchUser = vi.fn<[], Promise<User>>();

// ❌ 型エラー
fetchUser.mockResolvedValue({ id: 1 }); // nameプロパティがない
```

**解決策**: 正しい型のオブジェクトを返す

```typescript
// ✅ 正しい方法
fetchUser.mockResolvedValue({
  id: 1,
  name: 'Test User',
});

// または、部分的なオブジェクトを許可する場合
const fetchUser = vi.fn<[], Promise<Partial<User>>>();
```

### エラー5: 非同期関数で同期モックを使用

**問題**: 非同期関数に`mockReturnValue()`を使用してしまう

```typescript
// ❌ 間違い
const asyncFn = vi.fn();
asyncFn.mockReturnValue({ data: 'test' });

// awaitしても期待通りにならない
const result = await asyncFn(); // { data: 'test' }ではなく Promise
```

**解決策**: `mockResolvedValue()`を使用する

```typescript
// ✅ 正しい方法
const asyncFn = vi.fn();
asyncFn.mockResolvedValue({ data: 'test' });

const result = await asyncFn(); // { data: 'test' }
```

### エラー6: モックが上書きされる

**問題**: 複数のテストで同じモックを使用すると、前のテストの設定が残る

```typescript
describe('Tests', () => {
  const mockFn = vi.fn();

  it('test 1', () => {
    mockFn.mockReturnValue('test1');
    expect(mockFn()).toBe('test1');
  });

  it('test 2', () => {
    // test1の設定が残っている
    expect(mockFn()).toBe('test1'); // まだ'test1'が返る
  });
});
```

**解決策**: `afterEach`でモックをリセットする

```typescript
describe('Tests', () => {
  const mockFn = vi.fn();

  afterEach(() => {
    mockFn.mockReset(); // または mockClear()
  });

  it('test 1', () => {
    mockFn.mockReturnValue('test1');
    expect(mockFn()).toBe('test1');
  });

  it('test 2', () => {
    mockFn.mockReturnValue('test2');
    expect(mockFn()).toBe('test2'); // 正しく'test2'が返る
  });
});
```

---

## まとめ

### 戻り値モックのクイックリファレンス

| 用途 | メソッド | 例 |
|------|----------|-----|
| 固定値を返す | `mockReturnValue()` | `fn.mockReturnValue(42)` |
| Promise成功 | `mockResolvedValue()` | `fn.mockResolvedValue({data: 'ok'})` |
| Promiseエラー | `mockRejectedValue()` | `fn.mockRejectedValue(new Error())` |
| 1回だけ固定値 | `mockReturnValueOnce()` | `fn.mockReturnValueOnce(1)` |
| 1回だけPromise成功 | `mockResolvedValueOnce()` | `fn.mockResolvedValueOnce({})` |
| 1回だけPromiseエラー | `mockRejectedValueOnce()` | `fn.mockRejectedValueOnce(err)` |
| カスタム実装 | `mockImplementation()` | `fn.mockImplementation(x => x*2)` |
| 1回だけカスタム | `mockImplementationOnce()` | `fn.mockImplementationOnce(...)` |

### 選択基準

1. **単純な固定値**: `mockReturnValue()`
2. **非同期処理**: `mockResolvedValue()` / `mockRejectedValue()`
3. **呼び出しごとに異なる値**: `mockReturnValueOnce()`をチェーン
4. **引数に応じて変化**: `mockImplementation()`
5. **複雑なロジック**: `mockImplementation()`

### ベストプラクティス

- 非同期関数には必ず`mockResolvedValue()`を使用
- テスト後は`mockReset()`でクリーンアップ
- 型安全性を保つためにTypeScriptの型を活用
- ファクトリー関数でモックデータを再利用可能に
- エラーケースも必ずテストする

これで、Vitestにおける戻り値のモック化を完全にマスターできます！
