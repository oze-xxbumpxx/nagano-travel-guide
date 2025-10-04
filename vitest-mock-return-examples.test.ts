import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// =====================================
// 1. 基本的な戻り値のモック
// =====================================

describe('基本的な戻り値のモック', () => {
  it('mockReturnValue - 固定値を返す', () => {
    const getValue = vi.fn();
    getValue.mockReturnValue(42);

    expect(getValue()).toBe(42);
    expect(getValue()).toBe(42);
    expect(getValue('any', 'args')).toBe(42); // 引数に関係なく42
  });

  it('オブジェクトを返す', () => {
    const getUser = vi.fn();
    getUser.mockReturnValue({
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
    });

    const user = getUser();
    expect(user.name).toBe('田中太郎');
  });

  it('配列を返す', () => {
    const getItems = vi.fn();
    getItems.mockReturnValue(['item1', 'item2', 'item3']);

    const items = getItems();
    expect(items).toHaveLength(3);
    expect(items[0]).toBe('item1');
  });

  it('null や undefined を返す', () => {
    const findItem = vi.fn();

    findItem.mockReturnValue(null);
    expect(findItem()).toBeNull();

    findItem.mockReturnValue(undefined);
    expect(findItem()).toBeUndefined();
  });
});

// =====================================
// 2. 非同期関数の戻り値モック
// =====================================

describe('非同期関数の戻り値モック', () => {
  it('mockResolvedValue - Promise を成功させる', async () => {
    const fetchUser = vi.fn();
    fetchUser.mockResolvedValue({
      id: 1,
      name: '田中太郎',
    });

    const user = await fetchUser();
    expect(user.name).toBe('田中太郎');
  });

  it('mockRejectedValue - Promise を失敗させる', async () => {
    const fetchUser = vi.fn();
    fetchUser.mockRejectedValue(new Error('ユーザーが見つかりません'));

    await expect(fetchUser()).rejects.toThrow('ユーザーが見つかりません');
  });

  it('カスタムエラーオブジェクト', async () => {
    class ApiError extends Error {
      constructor(message: string, public statusCode: number) {
        super(message);
      }
    }

    const apiCall = vi.fn();
    apiCall.mockRejectedValue(new ApiError('認証エラー', 401));

    try {
      await apiCall();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(401);
    }
  });
});

// =====================================
// 3. 複数回の呼び出しで異なる値を返す
// =====================================

describe('複数回の呼び出しで異なる値を返す', () => {
  it('mockReturnValueOnce - 呼び出しごとに異なる値', () => {
    const getValue = vi.fn();

    getValue
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(3)
      .mockReturnValue(0); // 4回目以降

    expect(getValue()).toBe(1);
    expect(getValue()).toBe(2);
    expect(getValue()).toBe(3);
    expect(getValue()).toBe(0);
    expect(getValue()).toBe(0);
  });

  it('mockResolvedValueOnce - 非同期で異なる値', async () => {
    const fetchData = vi.fn();

    fetchData
      .mockResolvedValueOnce({ page: 1, data: ['item1', 'item2'] })
      .mockResolvedValueOnce({ page: 2, data: ['item3', 'item4'] })
      .mockResolvedValueOnce({ page: 3, data: [] });

    const page1 = await fetchData();
    expect(page1.page).toBe(1);
    expect(page1.data).toHaveLength(2);

    const page2 = await fetchData();
    expect(page2.page).toBe(2);

    const page3 = await fetchData();
    expect(page3.data).toHaveLength(0);
  });

  it('成功とエラーを混在', async () => {
    const apiCall = vi.fn();

    apiCall
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error('一時的なエラー'))
      .mockResolvedValueOnce({ success: true });

    // 1回目: 成功
    const result1 = await apiCall();
    expect(result1.success).toBe(true);

    // 2回目: エラー
    await expect(apiCall()).rejects.toThrow('一時的なエラー');

    // 3回目: 成功
    const result3 = await apiCall();
    expect(result3.success).toBe(true);
  });
});

// =====================================
// 4. 条件分岐による戻り値の制御
// =====================================

describe('条件分岐による戻り値の制御', () => {
  it('mockImplementation - 引数に応じて戻り値を変える', () => {
    const calculate = vi.fn();

    calculate.mockImplementation((operation: string, a: number, b: number) => {
      switch (operation) {
        case 'add':
          return a + b;
        case 'multiply':
          return a * b;
        case 'divide':
          return b !== 0 ? a / b : null;
        default:
          throw new Error('Unknown operation');
      }
    });

    expect(calculate('add', 5, 3)).toBe(8);
    expect(calculate('multiply', 5, 3)).toBe(15);
    expect(calculate('divide', 10, 2)).toBe(5);
    expect(calculate('divide', 10, 0)).toBeNull();
    expect(() => calculate('unknown', 1, 1)).toThrow('Unknown operation');
  });

  it('非同期のmockImplementation', async () => {
    const fetchUser = vi.fn();

    fetchUser.mockImplementation(async (userId: number) => {
      if (userId > 1000) {
        throw new Error('ユーザーが見つかりません');
      }

      if (userId === 1) {
        return { id: 1, name: '管理者', role: 'admin' };
      }

      return { id: userId, name: `ユーザー${userId}`, role: 'user' };
    });

    const admin = await fetchUser(1);
    expect(admin.role).toBe('admin');

    const user = await fetchUser(5);
    expect(user.name).toBe('ユーザー5');

    await expect(fetchUser(9999)).rejects.toThrow('ユーザーが見つかりません');
  });

  it('HTTPメソッドに応じた戻り値', async () => {
    const apiClient = vi.fn();

    apiClient.mockImplementation(async (method: string, url: string, data?: any) => {
      if (method === 'GET') {
        if (url.includes('/users')) {
          const userId = url.split('/').pop();
          return { data: { id: userId, name: `User ${userId}` } };
        }
      }

      if (method === 'POST') {
        return { data: { id: 999, ...data }, status: 201 };
      }

      if (method === 'DELETE') {
        return { status: 204 };
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    });

    const getResult = await apiClient('GET', '/api/users/123');
    expect(getResult.data.id).toBe('123');

    const postResult = await apiClient('POST', '/api/users', { name: '新規' });
    expect(postResult.status).toBe(201);

    const deleteResult = await apiClient('DELETE', '/api/users/1');
    expect(deleteResult.status).toBe(204);
  });
});

// =====================================
// 5. vi.spyOnで既存メソッドの戻り値をモック
// =====================================

describe('既存メソッドの戻り値をモック', () => {
  it('オブジェクトのメソッドをモック', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
      multiply: (a: number, b: number) => a * b,
    };

    const addSpy = vi.spyOn(calculator, 'add').mockReturnValue(100);

    // モックされた値が返る
    expect(calculator.add(2, 3)).toBe(100);

    // multiplyは影響を受けない
    expect(calculator.multiply(2, 3)).toBe(6);

    expect(addSpy).toHaveBeenCalledWith(2, 3);
  });

  it('クラスのメソッドをモック', () => {
    class UserService {
      getUsername(userId: number): string {
        return `user_${userId}`;
      }

      getUserEmail(userId: number): string {
        return `user${userId}@example.com`;
      }
    }

    const service = new UserService();
    const spy = vi.spyOn(service, 'getUsername').mockReturnValue('MockedUser');

    expect(service.getUsername(1)).toBe('MockedUser');
    expect(service.getUserEmail(1)).toBe('user1@example.com'); // 影響なし
  });
});

// =====================================
// 6. 実践例：APIクライアントのモック
// =====================================

interface User {
  id: number;
  name: string;
  email: string;
}

class ApiClient {
  async fetchUser(id: number): Promise<User> {
    // 実際のAPI呼び出し
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return response.json();
  }
}

describe('ApiClient のモック', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
  });

  it('ユーザーを取得', async () => {
    const mockUser: User = {
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
    };

    vi.spyOn(client, 'fetchUser').mockResolvedValue(mockUser);

    const user = await client.fetchUser(1);

    expect(user).toEqual(mockUser);
  });

  it('ユーザーを作成', async () => {
    const newUser = {
      name: '佐藤花子',
      email: 'sato@example.com',
    };

    const createdUser: User = { id: 2, ...newUser };

    vi.spyOn(client, 'createUser').mockResolvedValue(createdUser);

    const result = await client.createUser(newUser);

    expect(result.id).toBe(2);
    expect(result.name).toBe('佐藤花子');
  });

  it('エラーハンドリング', async () => {
    vi.spyOn(client, 'fetchUser').mockRejectedValue(
      new Error('Network error')
    );

    await expect(client.fetchUser(999)).rejects.toThrow('Network error');
  });
});

// =====================================
// 7. 実践例：リトライロジックのテスト
// =====================================

async function fetchWithRetry(
  url: string,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

describe('リトライロジックのテスト', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('2回失敗した後、3回目で成功', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ data: 'success' }),
    } as Response;

    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockResponse);

    const promise = fetchWithRetry('/api/data');

    // リトライの待機時間を進める
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('すべて失敗するとエラー', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const promise = fetchWithRetry('/api/data', 3);

    await vi.advanceTimersByTimeAsync(3000);

    await expect(promise).rejects.toThrow('Network error');
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

// =====================================
// 8. 実践例：ページネーションのテスト
// =====================================

interface PageResult<T> {
  items: T[];
  hasMore: boolean;
}

class PaginatedApi {
  async fetchPage(pageNumber: number): Promise<PageResult<string>> {
    const response = await fetch(`/api/items?page=${pageNumber}`);
    return response.json();
  }

  async fetchAllPages(): Promise<string[]> {
    const allItems: string[] = [];
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

describe('ページネーションのテスト', () => {
  it('すべてのページを取得', async () => {
    const api = new PaginatedApi();

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

// =====================================
// 9. 状態を持つモック
// =====================================

describe('状態を持つモック', () => {
  it('カウンターのシミュレーション', () => {
    let count = 0;

    const counter = vi.fn().mockImplementation(() => {
      return ++count;
    });

    expect(counter()).toBe(1);
    expect(counter()).toBe(2);
    expect(counter()).toBe(3);
  });

  it('呼び出し回数に応じた動作', () => {
    const fetchData = vi.fn();

    fetchData.mockImplementation(function(this: any) {
      const callCount = this.mock.calls.length;

      if (callCount <= 2) {
        return { loading: true, data: null };
      }

      return { loading: false, data: 'Loaded data' };
    });

    expect(fetchData()).toEqual({ loading: true, data: null });
    expect(fetchData()).toEqual({ loading: true, data: null });
    expect(fetchData()).toEqual({ loading: false, data: 'Loaded data' });
  });
});

// =====================================
// 10. ファクトリーパターンでモックデータ生成
// =====================================

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: '田中太郎',
    email: 'tanaka@example.com',
    ...overrides,
  };
}

describe('ファクトリーパターン', () => {
  it('デフォルトのユーザー', () => {
    const user = createMockUser();
    expect(user.name).toBe('田中太郎');
  });

  it('カスタマイズしたユーザー', () => {
    const admin = createMockUser({
      name: '管理者',
      email: 'admin@example.com',
    });

    expect(admin.name).toBe('管理者');
    expect(admin.id).toBe(1); // デフォルト値は保持
  });

  it('API呼び出しでファクトリーを使用', async () => {
    const fetchUser = vi.fn();

    fetchUser.mockResolvedValue(
      createMockUser({ name: 'カスタムユーザー' })
    );

    const user = await fetchUser();
    expect(user.name).toBe('カスタムユーザー');
  });
});
