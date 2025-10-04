# Vitestを使ったモック化の完全ガイド

## 目次
1. [モックとは何か](#モックとは何か)
2. [Vitestにおけるモックの種類](#vitestにおけるモックの種類)
3. [関数のモック](#関数のモック)
4. [モジュールのモック](#モジュールのモック)
5. [クラスのモック](#クラスのモック)
6. [グローバルオブジェクトのモック](#グローバルオブジェクトのモック)
7. [タイマーのモック](#タイマーのモック)
8. [実践的なモックパターン](#実践的なモックパターン)
9. [モックのベストプラクティス](#モックのベストプラクティス)
10. [よくある問題と解決策](#よくある問題と解決策)

---

## モックとは何か

### モックの基本概念

**モック（Mock）**とは、テスト対象のコードが依存している外部のコンポーネントや関数を、テスト用の偽物に置き換える技術です。モックを使用することで、以下のような利点が得られます：

1. **テストの独立性**: 外部APIやデータベースなどの実際のリソースに依存せず、テストを実行できます
2. **テストの高速化**: 実際のネットワーク通信や重い処理を模倣することで、テストが速く完了します
3. **予測可能な結果**: ランダムな値や外部環境に左右されず、常に同じ結果を得られます
4. **エッジケースのテスト**: エラーケースや特殊な状況を簡単に再現できます
5. **テストの信頼性**: 外部要因による失敗を防ぎ、テストが安定します

### モックとスタブとスパイの違い

テストにおける用語を整理しておきましょう：

- **モック（Mock）**: 呼び出しの記録を保持し、検証可能な偽物のオブジェクト
- **スタブ（Stub）**: あらかじめ決められた応答を返す偽物の実装
- **スパイ（Spy）**: 実際の実装を保持しつつ、呼び出しを記録するラッパー

Vitestでは、これらをすべて`vi`オブジェクトを通じて実現できます。実務上は、これらの用語を厳密に区別するよりも、「どのようにテスト対象の依存関係を制御するか」という観点で理解することが重要です。

---

## Vitestにおけるモックの種類

Vitestは主に以下の4つのモック手法を提供します：

### 1. vi.fn() - モック関数

`vi.fn()`は、最も基本的なモック作成方法です。これは、呼び出しを追跡し、任意の戻り値を返すことができる関数を作成します。

**使用場面**:
- コールバック関数をテストする場合
- 関数が正しい引数で呼ばれたかを確認する場合
- イベントハンドラーのテスト

### 2. vi.spyOn() - 既存オブジェクトのメソッドをスパイ

`vi.spyOn()`は、既存のオブジェクトのメソッドをモック化します。元の実装を保持したまま監視することも、完全に置き換えることもできます。

**使用場面**:
- 既存のクラスやオブジェクトのメソッドをモックする場合
- 元の実装を保持しつつ、呼び出しを監視したい場合
- 一部のメソッドだけをモックしたい場合

### 3. vi.mock() - モジュール全体のモック

`vi.mock()`は、インポートされるモジュール全体をモックします。これは最も強力なモック手法で、外部ライブラリや別ファイルのモジュールを完全に制御できます。

**使用場面**:
- 外部ライブラリ（axios, fetchなど）をモックする場合
- 他のモジュールからのインポートを制御する場合
- ESモジュールの静的インポートをモックする場合

### 4. vi.doMock() - 動的モジュールモック

`vi.doMock()`は、`vi.mock()`と似ていますが、テストケースごとに異なるモック実装を提供できます。

**使用場面**:
- 同じモジュールに対して、テストごとに異なる動作をさせたい場合
- 動的にモックの振る舞いを変更したい場合

---

## 関数のモック

### vi.fn() の詳細

`vi.fn()`は、モック関数（spy function）を作成します。この関数は以下の特徴を持ちます：

**作成方法**:
```typescript
const mockFunction = vi.fn();
```

**呼び出しの追跡**:
モック関数は、自分が呼ばれたかどうか、何回呼ばれたか、どんな引数で呼ばれたかをすべて記録します。

```typescript
mockFunction('hello', 123);
mockFunction('world', 456);

// 呼び出し履歴
console.log(mockFunction.mock.calls);
// [['hello', 123], ['world', 456]]

// 呼び出し回数
console.log(mockFunction.mock.calls.length); // 2
```

**デフォルトの実装**:
何も指定しない場合、`vi.fn()`は`undefined`を返します。

**カスタム実装の提供**:
モック関数に実装を与えることができます：

```typescript
const add = vi.fn((a, b) => a + b);
console.log(add(2, 3)); // 5
```

**戻り値の制御**:
モック関数の戻り値を動的に設定できます：

```typescript
const mockFn = vi.fn();

// 常に42を返す
mockFn.mockReturnValue(42);

// 1回目だけ特定の値を返す
mockFn.mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValue(0); // それ以降は0

console.log(mockFn()); // 1
console.log(mockFn()); // 2
console.log(mockFn()); // 0
console.log(mockFn()); // 0
```

**非同期関数のモック**:
Promise を返す関数もモックできます：

```typescript
const asyncMock = vi.fn();

// 成功のケース
asyncMock.mockResolvedValue({ data: 'success' });

// エラーのケース
asyncMock.mockRejectedValue(new Error('API Error'));

// 順番に異なる結果を返す
asyncMock
  .mockResolvedValueOnce({ data: 'first' })
  .mockResolvedValueOnce({ data: 'second' })
  .mockRejectedValueOnce(new Error('Failed'));
```

**実装の動的な変更**:
`mockImplementation()`を使うと、より複雑なロジックを実装できます：

```typescript
const validator = vi.fn();

validator.mockImplementation((value) => {
  if (typeof value !== 'string') {
    throw new Error('String required');
  }
  return value.length > 0;
});
```

### vi.fn() の使用例

**例1: コールバック関数のテスト**

テスト対象の関数がコールバックを正しく呼んでいるかを確認する場合：

```typescript
function processData(data: number[], callback: (sum: number) => void) {
  const sum = data.reduce((acc, val) => acc + val, 0);
  callback(sum);
}

it('コールバックが合計値で呼ばれる', () => {
  const callback = vi.fn();
  processData([1, 2, 3, 4, 5], callback);
  
  expect(callback).toHaveBeenCalledWith(15);
  expect(callback).toHaveBeenCalledTimes(1);
});
```

この例では、`processData`関数が正しく合計を計算し、その結果でコールバックを呼んでいることを検証しています。

**例2: イベントハンドラーのテスト**

Reactコンポーネントのイベントハンドラーをテストする場合：

```typescript
function SubmitButton({ onSubmit }: { onSubmit: () => void }) {
  return <button onClick={onSubmit}>送信</button>;
}

it('ボタンクリックでonSubmitが呼ばれる', () => {
  const handleSubmit = vi.fn();
  const { getByText } = render(<SubmitButton onSubmit={handleSubmit} />);
  
  fireEvent.click(getByText('送信'));
  
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});
```

### モック関数の検証メソッド

Vitestは、モック関数の呼び出しを検証するための豊富なマッチャーを提供しています：

- `toHaveBeenCalled()`: 少なくとも1回呼ばれた
- `toHaveBeenCalledTimes(n)`: n回呼ばれた
- `toHaveBeenCalledWith(arg1, arg2, ...)`: 特定の引数で呼ばれた
- `toHaveBeenLastCalledWith(...)`: 最後の呼び出しが特定の引数だった
- `toHaveBeenNthCalledWith(n, ...)`: n回目の呼び出しが特定の引数だった
- `toHaveReturned()`: 例外を投げずに戻り値を返した
- `toHaveReturnedWith(value)`: 特定の値を返した

---

## モジュールのモック

### vi.mock() の詳細

`vi.mock()`は、Vitestの最も強力なモック機能です。これにより、外部モジュールやライブラリを完全に制御できます。

**基本的な使い方**:
```typescript
import { someFunction } from './myModule';

// モジュール全体をモック
vi.mock('./myModule');
```

**重要な特徴**:

1. **ホイスティング**: `vi.mock()`の呼び出しは、ファイルの最上部に自動的に巻き上げられます。これは、実際のモジュールがインポートされる前にモックが設定されることを保証します。

2. **静的解析**: モジュールパスは文字列リテラルである必要があります。変数を使用することはできません。

3. **自動モック**: モジュールパスだけを指定すると、Vitestはそのモジュールのすべてのエクスポートを自動的にモック関数に置き換えます。

**カスタムモック実装の提供**:

第2引数にファクトリ関数を渡すことで、モジュールのモック実装を定義できます：

```typescript
vi.mock('./userService', () => {
  return {
    fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
    createUser: vi.fn().mockResolvedValue({ id: 2, name: 'New User' }),
  };
});
```

**部分的なモック**:

モジュールの一部だけをモックし、残りは実際の実装を使いたい場合：

```typescript
vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');
  return {
    ...actual,
    // fetchDataだけをモック、他は実際の実装を使用
    fetchData: vi.fn().mockResolvedValue({ data: 'mocked' }),
  };
});
```

この手法は、大きなモジュールの特定の関数だけをモックしたい場合に非常に便利です。

### 外部ライブラリのモック

**axios のモック例**:

axiosは、最もよくモックされるライブラリの一つです：

```typescript
import axios from 'axios';
import { vi } from 'vitest';

// axios全体をモック
vi.mock('axios');

it('ユーザーデータを取得する', async () => {
  const mockUser = { id: 1, name: '田中太郎' };
  
  // axios.getの戻り値を設定
  vi.mocked(axios.get).mockResolvedValue({ data: mockUser });
  
  const response = await axios.get('/api/users/1');
  
  expect(response.data).toEqual(mockUser);
  expect(axios.get).toHaveBeenCalledWith('/api/users/1');
});
```

`vi.mocked()`ヘルパー関数を使用すると、TypeScriptの型安全性を保ちながらモックを操作できます。

**fetch のモック**:

グローバルな`fetch` APIをモックする場合：

```typescript
global.fetch = vi.fn();

it('データをフェッチする', async () => {
  const mockData = { id: 1, title: 'Test' };
  
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => mockData,
  } as Response);
  
  const response = await fetch('/api/data');
  const data = await response.json();
  
  expect(data).toEqual(mockData);
});
```

### vi.doMock() - 動的モック

`vi.mock()`はファイルの最上部にホイスティングされるため、すべてのテストで同じモック実装が使用されます。テストごとに異なるモック実装が必要な場合は、`vi.doMock()`を使用します：

```typescript
describe('異なるモック動作', () => {
  beforeEach(() => {
    vi.resetModules(); // モジュールキャッシュをクリア
  });

  it('成功ケース', async () => {
    vi.doMock('./api', () => ({
      fetchData: vi.fn().mockResolvedValue({ success: true }),
    }));
    
    const { fetchData } = await import('./api');
    const result = await fetchData();
    expect(result.success).toBe(true);
  });

  it('エラーケース', async () => {
    vi.doMock('./api', () => ({
      fetchData: vi.fn().mockRejectedValue(new Error('Failed')),
    }));
    
    const { fetchData } = await import('./api');
    await expect(fetchData()).rejects.toThrow('Failed');
  });
});
```

**重要なポイント**:
- `vi.doMock()`を使用する場合、`vi.resetModules()`を呼び出してモジュールキャッシュをクリアする必要があります
- モジュールを動的に`import()`する必要があります（静的インポートは使用できません）

---

## クラスのモック

クラスのモックは、オブジェクト指向のコードをテストする際に頻繁に必要となります。

### クラス全体のモック

クラス全体をモックする最も簡単な方法は、`vi.mock()`を使用することです：

```typescript
// userService.ts
export class UserService {
  async getUser(id: number) {
    // 実際のAPI呼び出し
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
  
  async saveUser(user: User) {
    // データベースへの保存
    return db.save(user);
  }
}

// test.ts
vi.mock('./userService', () => {
  return {
    UserService: vi.fn().mockImplementation(() => {
      return {
        getUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
        saveUser: vi.fn().mockResolvedValue({ id: 1 }),
      };
    }),
  };
});
```

### クラスのインスタンスメソッドのモック

既にインスタンス化されたクラスのメソッドをモックする場合は、`vi.spyOn()`を使用します：

```typescript
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
  
  multiply(a: number, b: number): number {
    return a * b;
  }
}

it('calculatorのメソッドをモック', () => {
  const calc = new Calculator();
  
  // addメソッドだけをモック
  const addSpy = vi.spyOn(calc, 'add').mockReturnValue(100);
  
  expect(calc.add(2, 3)).toBe(100); // モックされた値
  expect(calc.multiply(2, 3)).toBe(6); // 実際の実装
  
  expect(addSpy).toHaveBeenCalledWith(2, 3);
});
```

この方法の利点は、クラスの一部のメソッドだけをモックし、他のメソッドは実際の実装を使用できることです。

### コンストラクターのモック

クラスのコンストラクターをモックして、インスタンス化を制御することもできます：

```typescript
class DatabaseConnection {
  constructor(private connectionString: string) {
    // 実際の接続処理（テストでは避けたい）
  }
  
  query(sql: string) {
    // データベースクエリ
  }
}

// コンストラクターをモック
vi.spyOn(DatabaseConnection.prototype, 'constructor').mockImplementation(() => {
  // 何もしない
});

// または、クラス全体をモック
const MockDatabase = vi.fn().mockImplementation(() => ({
  query: vi.fn().mockResolvedValue([{ id: 1 }]),
}));
```

---

## グローバルオブジェクトのモック

### window、document、localStorage

ブラウザのグローバルオブジェクトをモックすることは、フロントエンドのテストで頻繁に必要となります。

**localStorage のモック**:

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

// または、実際の実装を監視
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem');
  vi.spyOn(Storage.prototype, 'setItem');
});

it('localStorageにデータを保存', () => {
  localStorage.setItem('key', 'value');
  
  expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value');
});
```

**window.location のモック**:

`window.location`は特殊なオブジェクトで、通常は変更できません。テストでモックするには：

```typescript
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  pathname: '/test',
  search: '?query=test',
} as any;

// または、特定のプロパティだけをモック
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
  },
  writable: true,
});
```

**matchMedia のモック**:

レスポンシブデザインのテストでは、`matchMedia`をモックする必要があります：

```typescript
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
```

### グローバル関数のモック

**alert、confirm、prompt**:

```typescript
global.alert = vi.fn();
global.confirm = vi.fn().mockReturnValue(true);
global.prompt = vi.fn().mockReturnValue('user input');

it('アラートを表示', () => {
  alert('メッセージ');
  expect(global.alert).toHaveBeenCalledWith('メッセージ');
});
```

**console のモック**:

テスト中のコンソール出力を抑制したい場合：

```typescript
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

---

## タイマーのモック

タイマー関連の関数（`setTimeout`、`setInterval`、`Date`）をモックすることで、時間に依存するテストを高速かつ予測可能にできます。

### vi.useFakeTimers()

`vi.useFakeTimers()`を呼び出すと、すべてのタイマー関数がフェイクタイマーに置き換えられます：

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('1秒後にコールバックが実行される', () => {
  const callback = vi.fn();
  
  setTimeout(callback, 1000);
  
  // まだ呼ばれていない
  expect(callback).not.toHaveBeenCalled();
  
  // 1秒進める
  vi.advanceTimersByTime(1000);
  
  // 呼ばれた
  expect(callback).toHaveBeenCalledTimes(1);
});
```

### タイマーの操作方法

**vi.advanceTimersByTime(ms)**:
指定したミリ秒だけ時間を進めます。

```typescript
vi.advanceTimersByTime(1000); // 1秒進める
vi.advanceTimersByTime(5000); // 5秒進める
```

**vi.runAllTimers()**:
すべての保留中のタイマーを実行します。

```typescript
setTimeout(callback1, 1000);
setTimeout(callback2, 2000);

vi.runAllTimers(); // 両方とも実行される
```

**vi.runOnlyPendingTimers()**:
現在保留中のタイマーだけを実行します。新しく追加されたタイマーは実行しません。

```typescript
setTimeout(() => {
  setTimeout(callback2, 1000); // これは実行されない
}, 1000);

vi.runOnlyPendingTimers(); // 最初のタイマーだけ実行
```

**vi.advanceTimersToNextTimer()**:
次のタイマーまで時間を進めます。

```typescript
setTimeout(callback1, 1000);
setTimeout(callback2, 3000);

vi.advanceTimersToNextTimer(); // callback1が実行される
vi.advanceTimersToNextTimer(); // callback2が実行される
```

### Date のモック

現在時刻をモックする場合：

```typescript
const mockDate = new Date('2024-01-01T00:00:00Z');
vi.setSystemTime(mockDate);

const now = new Date();
expect(now.toISOString()).toBe('2024-01-01T00:00:00.000Z');

// 元に戻す
vi.useRealTimers();
```

### 実用例：デバウンス関数のテスト

デバウンス関数は、タイマーのモックの典型的な使用例です：

```typescript
function debounce(fn: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('指定時間内の連続呼び出しは最後の1回だけ実行', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 1000);

    // 3回呼び出す
    debouncedFn('call 1');
    debouncedFn('call 2');
    debouncedFn('call 3');

    // まだ実行されていない
    expect(callback).not.toHaveBeenCalled();

    // 1秒進める
    vi.advanceTimersByTime(1000);

    // 最後の呼び出しだけが実行される
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('call 3');
  });
});
```

---

## 実践的なモックパターン

### パターン1: リポジトリパターンのモック

データアクセス層をモックする場合：

```typescript
// repository.ts
interface UserRepository {
  findById(id: number): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: number): Promise<void>;
}

// service.ts
class UserService {
  constructor(private repository: UserRepository) {}
  
  async getUser(id: number) {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}

// test.ts
it('ユーザーが見つからない場合はエラー', async () => {
  const mockRepository: UserRepository = {
    findById: vi.fn().mockResolvedValue(null),
    save: vi.fn(),
    delete: vi.fn(),
  };
  
  const service = new UserService(mockRepository);
  
  await expect(service.getUser(999)).rejects.toThrow('User not found');
  expect(mockRepository.findById).toHaveBeenCalledWith(999);
});
```

このパターンの利点は、依存性注入を使用することで、テストが容易になり、コードの結合度が低くなることです。

### パターン2: APIクライアントのモック

HTTPクライアントをラップしたAPIクライアントのモック：

```typescript
// apiClient.ts
class ApiClient {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');
    return response.json();
  }
  
  async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

// test.ts
describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
    global.fetch = vi.fn();
  });

  it('GETリクエストを送信', async () => {
    const mockData = { id: 1, name: 'Test' };
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);
    
    const result = await client.get('/api/users/1');
    
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  });

  it('エラーレスポンスの処理', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);
    
    await expect(client.get('/api/users/999')).rejects.toThrow('API Error');
  });
});
```

### パターン3: 環境変数のモック

環境変数に依存するコードをテストする場合：

```typescript
describe('環境変数に依存する機能', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules(); // モジュールキャッシュをクリア
    process.env = { ...originalEnv }; // 元の環境変数をコピー
  });

  afterEach(() => {
    process.env = originalEnv; // 元に戻す
  });

  it('開発環境の動作', async () => {
    process.env.NODE_ENV = 'development';
    process.env.API_URL = 'http://localhost:3000';
    
    const { getApiUrl } = await import('./config');
    expect(getApiUrl()).toBe('http://localhost:3000');
  });

  it('本番環境の動作', async () => {
    process.env.NODE_ENV = 'production';
    process.env.API_URL = 'https://api.example.com';
    
    const { getApiUrl } = await import('./config');
    expect(getApiUrl()).toBe('https://api.example.com');
  });
});
```

### パターン4: Reactコンテキストのモック

React Contextを使用しているコンポーネントのテスト：

```typescript
// AuthContext.tsx
const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// Component.tsx
function ProfilePage() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}

// test.tsx
function renderWithAuth(ui: React.ReactElement, authValue: Partial<AuthContextType>) {
  const defaultAuthValue: AuthContextType = {
    user: { id: 1, name: 'Test User' },
    login: vi.fn(),
    logout: vi.fn(),
    ...authValue,
  };
  
  return render(
    <AuthContext.Provider value={defaultAuthValue}>
      {ui}
    </AuthContext.Provider>
  );
}

it('ユーザー名を表示し、ログアウトできる', () => {
  const logout = vi.fn();
  const { getByText } = renderWithAuth(<ProfilePage />, { logout });
  
  expect(getByText('Test User')).toBeInTheDocument();
  
  fireEvent.click(getByText('ログアウト'));
  expect(logout).toHaveBeenCalledTimes(1);
});
```

### パターン5: カスタムフックのモック

他のカスタムフックに依存するフックをテストする場合：

```typescript
// useUser.ts
function useUser(userId: number) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading };
}

// useUserProfile.ts
function useUserProfile(userId: number) {
  const { user, loading } = useUser(userId);
  const displayName = user ? `${user.firstName} ${user.lastName}` : '';
  
  return { displayName, loading };
}

// test.ts
vi.mock('./useUser');

it('useUserProfileがuseUserを使用する', () => {
  const mockUser = { firstName: '太郎', lastName: '田中' };
  
  vi.mocked(useUser).mockReturnValue({
    user: mockUser,
    loading: false,
  });
  
  const { result } = renderHook(() => useUserProfile(1));
  
  expect(result.current.displayName).toBe('太郎 田中');
  expect(result.current.loading).toBe(false);
});
```

---

## モックのベストプラクティス

### 1. モックは必要最小限に

モックを使いすぎると、テストが実装の詳細に依存しすぎて、脆くなります。モックが必要なのは：

- 外部システム（API、データベース）との通信
- 時間やランダム性に依存する処理
- ファイルシステムやネットワークI/O
- テストが遅くなる重い処理

純粋な関数やビジネスロジックは、可能な限り実際の実装をテストすべきです。

### 2. テスト用の設定ファイルを活用

すべてのテストで共通するモック設定は、`setupTests.ts`にまとめましょう：

```typescript
// setupTests.ts
import { vi } from 'vitest';

// グローバルなモック
global.fetch = vi.fn();
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// すべてのテスト後にモックをクリア
afterEach(() => {
  vi.clearAllMocks();
});
```

### 3. モックのクリーンアップを忘れずに

各テスト後にモックをクリアまたはリストアすることで、テスト間の独立性を保ちます：

```typescript
describe('テストスイート', () => {
  afterEach(() => {
    vi.clearAllMocks();   // 呼び出し履歴をクリア
    vi.resetAllMocks();   // モック実装もリセット
    vi.restoreAllMocks(); // 元の実装に戻す
  });
});
```

**違い**:
- `clearAllMocks()`: 呼び出し履歴だけをクリア
- `resetAllMocks()`: 履歴と実装をクリア（空のモックに戻す）
- `restoreAllMocks()`: 元の実装に完全に戻す

### 4. 型安全なモック

TypeScriptを使用している場合、`vi.mocked()`ヘルパーを使うと型安全性が向上します：

```typescript
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');

// ❌ 型エラーが起きる可能性
axios.get.mockResolvedValue({ data: {} });

// ✅ 型安全
vi.mocked(axios.get).mockResolvedValue({ data: {} });
```

### 5. 実装の詳細ではなく、振る舞いをテスト

モックを使用する際は、「どのように実装されているか」ではなく、「何をするか」をテストしましょう：

```typescript
// ❌ 悪い例：実装の詳細をテスト
it('内部でfetchを呼ぶ', async () => {
  await getUser(1);
  expect(fetch).toHaveBeenCalled();
});

// ✅ 良い例：振る舞いをテスト
it('ユーザーデータを返す', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, name: 'Test' }),
  } as Response);
  
  const user = await getUser(1);
  expect(user).toEqual({ id: 1, name: 'Test' });
});
```

### 6. モックファクトリーを作成

同じモックを複数のテストで使用する場合、ファクトリー関数を作成すると便利です：

```typescript
// testUtils.ts
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}

export function createMockApiClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
}

// test.ts
it('テスト', async () => {
  const mockUser = createMockUser({ name: 'Custom Name' });
  const apiClient = createMockApiClient();
  
  apiClient.get.mockResolvedValue(mockUser);
  // ...
});
```

### 7. MSW（Mock Service Worker）を検討

API呼び出しのモックが複雑になる場合、MSWの使用を検討しましょう。MSWはネットワークレベルでリクエストをインターセプトするため、より現実的なテストが可能です：

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: 1, name: 'Test User' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## よくある問題と解決策

### 問題1: モジュールモックが効かない

**症状**: `vi.mock()`を使用しているのに、実際のモジュールが呼ばれる

**原因と解決策**:

1. **インポートの順序**: `vi.mock()`はインポートより前に書く必要があります（ホイスティングされますが、明示的に書くのが良い）

```typescript
// ❌ 悪い例
import { myFunction } from './module';
vi.mock('./module');

// ✅ 良い例
vi.mock('./module');
import { myFunction } from './module';
```

2. **動的インポート**: ESモジュールを使用している場合、静的解析が必要

```typescript
// モックが必要な場合は、vi.mock()を最上部に
vi.mock('./module');

// 動的インポートを使用する場合は vi.doMock()
vi.doMock('./module', () => ({
  myFunction: vi.fn(),
}));
const { myFunction } = await import('./module');
```

### 問題2: タイプエラー

**症状**: TypeScriptで型エラーが発生する

**解決策**: `vi.mocked()`を使用するか、型アサーションを追加

```typescript
import axios from 'axios';

// 方法1: vi.mocked()
vi.mocked(axios.get).mockResolvedValue({ data: {} });

// 方法2: 型アサーション
(axios.get as any).mockResolvedValue({ data: {} });

// 方法3: MockedFunction型
import type { MockedFunction } from 'vitest';
const mockAxiosGet = axios.get as MockedFunction<typeof axios.get>;
mockAxiosGet.mockResolvedValue({ data: {} });
```

### 問題3: モックがリセットされない

**症状**: 前のテストのモック設定が次のテストに影響する

**解決策**: `afterEach`でモックをクリア

```typescript
describe('テストスイート', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  // または vitest.config.ts で設定
  // test: {
  //   clearMocks: true,
  // }
});
```

### 問題4: フェイクタイマーで非同期処理が完了しない

**症状**: `vi.useFakeTimers()`使用時に、Promise が解決されない

**解決策**: `vi.runAllTimersAsync()`を使用

```typescript
it('非同期タイマーのテスト', async () => {
  vi.useFakeTimers();
  
  const promise = someAsyncFunction();
  
  // ❌ これだけだと Promise が解決されない
  vi.runAllTimers();
  
  // ✅ 非同期版を使用
  await vi.runAllTimersAsync();
  
  const result = await promise;
  expect(result).toBe('expected value');
});
```

### 問題5: グローバルオブジェクトのモックが効かない

**症状**: `window`や`document`のモックが反映されない

**解決策**: `Object.defineProperty`を使用

```typescript
// ❌ これだと効かない場合がある
window.location = { href: 'http://test.com' } as any;

// ✅ definePropertyを使用
Object.defineProperty(window, 'location', {
  value: { href: 'http://test.com' },
  writable: true,
});
```

### 問題6: モックモジュールで実際の値も使いたい

**症状**: モジュールの一部だけをモックし、他は実際の実装を使いたい

**解決策**: `vi.importActual()`を使用

```typescript
vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');
  return {
    ...actual,
    // specificFunctionだけをモック
    specificFunction: vi.fn(),
  };
});
```

### 問題7: クラスのコンストラクターがモックできない

**症状**: クラスをインスタンス化する際、コンストラクターの処理がスキップできない

**解決策**: ファクトリーパターンを使用するか、クラス全体をモック

```typescript
// 方法1: モジュールレベルでモック
vi.mock('./MyClass', () => {
  return {
    MyClass: vi.fn().mockImplementation(() => ({
      method1: vi.fn(),
      method2: vi.fn(),
    })),
  };
});

// 方法2: ファクトリーパターンにリファクタリング
// 元のコード
class MyClass {
  constructor(private config: Config) {
    // 重い処理
  }
}

// リファクタリング後
function createMyClass(config: Config): MyClass {
  return new MyClass(config);
}

// テストでファクトリーをモック
vi.mock('./factory', () => ({
  createMyClass: vi.fn().mockReturnValue({
    method1: vi.fn(),
  }),
}));
```

---

## まとめ

Vitestのモック機能は、テストを効率的かつ信頼性の高いものにするための強力なツールです。重要なポイントをまとめると：

### モックの選択基準

1. **単純なコールバックや関数**: `vi.fn()`
2. **既存オブジェクトのメソッド**: `vi.spyOn()`
3. **外部モジュールやライブラリ**: `vi.mock()`
4. **テストごとに異なるモック**: `vi.doMock()`
5. **時間依存の処理**: `vi.useFakeTimers()`

### ベストプラクティス

- モックは必要最小限に抑える
- 実装の詳細ではなく、振る舞いをテストする
- テスト後に必ずクリーンアップする
- 型安全性を保つ（`vi.mocked()`を使用）
- 共通のモック設定は`setupTests.ts`にまとめる

### トラブルシューティング

- モックが効かない場合は、インポートの順序を確認
- 型エラーは`vi.mocked()`で解決
- テスト間の影響は`afterEach`でクリア
- 部分的なモックは`vi.importActual()`を使用

Vitestのモック機能を適切に使用することで、外部依存を気にせず、高速で信頼性の高いテストを書くことができます。モックは強力なツールですが、使いすぎるとテストが脆くなるため、バランスを取ることが重要です。
