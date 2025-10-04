import { describe, it, expect, vi, beforeEach } from 'vitest';

// =====================================
// mockReturnValue の使い方
// =====================================

describe('mockReturnValue() - 同期的に値を返す', () => {
  it('基本的な使い方', () => {
    const getValue = vi.fn();
    getValue.mockReturnValue(42);

    expect(getValue()).toBe(42);
    expect(getValue()).toBe(42); // 何度呼んでも同じ値
    expect(getValue('any', 'args')).toBe(42); // 引数に関係なく同じ値
  });

  it('文字列を返す', () => {
    const getName = vi.fn();
    getName.mockReturnValue('田中太郎');

    expect(getName()).toBe('田中太郎');
  });

  it('オブジェクトを返す', () => {
    const getUser = vi.fn();
    getUser.mockReturnValue({
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
    });

    const user = getUser();
    expect(user.id).toBe(1);
    expect(user.name).toBe('田中太郎');
  });

  it('配列を返す', () => {
    const getItems = vi.fn();
    getItems.mockReturnValue(['item1', 'item2', 'item3']);

    const items = getItems();
    expect(items).toHaveLength(3);
    expect(items[0]).toBe('item1');
  });

  it('真偽値を返す', () => {
    const isValid = vi.fn();
    isValid.mockReturnValue(true);

    expect(isValid()).toBe(true);
  });

  it('null を返す', () => {
    const findItem = vi.fn();
    findItem.mockReturnValue(null);

    expect(findItem()).toBeNull();
  });

  it('undefined を返す', () => {
    const getValue = vi.fn();
    getValue.mockReturnValue(undefined);

    expect(getValue()).toBeUndefined();
  });

  it('既存のメソッドの戻り値をモック', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
    };

    vi.spyOn(calculator, 'add').mockReturnValue(100);

    // 実際の計算は無視され、常に100が返る
    expect(calculator.add(2, 3)).toBe(100);
    expect(calculator.add(10, 20)).toBe(100);
  });

  it('戻り値を上書きできる', () => {
    const getValue = vi.fn();

    getValue.mockReturnValue('first');
    expect(getValue()).toBe('first');

    getValue.mockReturnValue('second');
    expect(getValue()).toBe('second');
  });
});

// =====================================
// mockResolvedValue の使い方
// =====================================

describe('mockResolvedValue() - 非同期で成功', () => {
  it('基本的な使い方', async () => {
    const fetchUser = vi.fn();
    fetchUser.mockResolvedValue({
      id: 1,
      name: '田中太郎',
    });

    const user = await fetchUser();
    expect(user.id).toBe(1);
    expect(user.name).toBe('田中太郎');
  });

  it('Promiseを返すことを確認', () => {
    const asyncFn = vi.fn();
    asyncFn.mockResolvedValue('success');

    const result = asyncFn();
    expect(result).toBeInstanceOf(Promise);
  });

  it('API呼び出しのモック', async () => {
    interface User {
      id: number;
      name: string;
      email: string;
    }

    const fetchUser = vi.fn();
    const mockUser: User = {
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
    };

    fetchUser.mockResolvedValue(mockUser);

    const user = await fetchUser(1);
    expect(user).toEqual(mockUser);
    expect(fetchUser).toHaveBeenCalledWith(1);
  });

  it('データベースクエリのモック', async () => {
    class UserRepository {
      async findById(id: number) {
        // 実際のDB接続
        return { id, name: 'Real User' };
      }
    }

    const repo = new UserRepository();
    const mockUser = { id: 1, name: 'Mocked User' };

    vi.spyOn(repo, 'findById').mockResolvedValue(mockUser);

    const user = await repo.findById(1);
    expect(user.name).toBe('Mocked User');
  });

  it('複数の値を順番に返す', async () => {
    const fetchData = vi.fn();

    fetchData
      .mockResolvedValueOnce({ page: 1, data: ['item1'] })
      .mockResolvedValueOnce({ page: 2, data: ['item2'] })
      .mockResolvedValueOnce({ page: 3, data: [] });

    const page1 = await fetchData();
    expect(page1.page).toBe(1);

    const page2 = await fetchData();
    expect(page2.page).toBe(2);

    const page3 = await fetchData();
    expect(page3.data).toHaveLength(0);
  });

  it('axiosのモック', async () => {
    const axios = {
      get: vi.fn(),
    };

    axios.get.mockResolvedValue({
      data: { id: 1, name: 'Test' },
      status: 200,
      statusText: 'OK',
    });

    const response = await axios.get('/api/users/1');
    expect(response.data.name).toBe('Test');
    expect(response.status).toBe(200);
  });

  it('ファイル読み込みのモック', async () => {
    const readFile = vi.fn();
    const fileContent = 'ファイルの内容';

    readFile.mockResolvedValue(fileContent);

    const content = await readFile('test.txt');
    expect(content).toBe(fileContent);
  });
});

// =====================================
// mockRejectedValue の使い方
// =====================================

describe('mockRejectedValue() - 非同期でエラー', () => {
  it('基本的な使い方', async () => {
    const fetchUser = vi.fn();
    fetchUser.mockRejectedValue(new Error('ユーザーが見つかりません'));

    await expect(fetchUser(999)).rejects.toThrow('ユーザーが見つかりません');
  });

  it('try-catch でエラーをキャッチ', async () => {
    const apiCall = vi.fn();
    apiCall.mockRejectedValue(new Error('API Error'));

    try {
      await apiCall();
      // ここには到達しない
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('API Error');
    }
  });

  it('カスタムエラークラス', async () => {
    class ApiError extends Error {
      constructor(message: string, public statusCode: number) {
        super(message);
        this.name = 'ApiError';
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

  it('HTTPエラーレスポンス', async () => {
    const axios = {
      get: vi.fn(),
    };

    const errorResponse = {
      response: {
        status: 404,
        statusText: 'Not Found',
        data: { message: 'リソースが見つかりません' },
      },
    };

    axios.get.mockRejectedValue(errorResponse);

    try {
      await axios.get('/api/users/999');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('リソースが見つかりません');
    }
  });

  it('複数回のエラー', async () => {
    const apiCall = vi.fn();
    apiCall.mockRejectedValue(new Error('Always fails'));

    await expect(apiCall()).rejects.toThrow('Always fails');
    await expect(apiCall()).rejects.toThrow('Always fails');
    await expect(apiCall()).rejects.toThrow('Always fails');
  });

  it('1回だけエラー、その後は成功', async () => {
    const apiCall = vi.fn();

    apiCall
      .mockRejectedValueOnce(new Error('First call fails'))
      .mockResolvedValue({ success: true });

    // 1回目: エラー
    await expect(apiCall()).rejects.toThrow('First call fails');

    // 2回目以降: 成功
    const result = await apiCall();
    expect(result.success).toBe(true);
  });
});

// =====================================
// 3つのメソッドを組み合わせる
// =====================================

describe('3つのメソッドの組み合わせ', () => {
  it('成功とエラーを混在させる', async () => {
    const apiCall = vi.fn();

    apiCall
      .mockResolvedValueOnce({ data: 'success' })           // 1回目: 成功
      .mockRejectedValueOnce(new Error('Temporary error'))  // 2回目: エラー
      .mockResolvedValueOnce({ data: 'success again' });    // 3回目: 成功

    // 1回目
    const result1 = await apiCall();
    expect(result1.data).toBe('success');

    // 2回目
    await expect(apiCall()).rejects.toThrow('Temporary error');

    // 3回目
    const result3 = await apiCall();
    expect(result3.data).toBe('success again');
  });

  it('リトライロジックのテスト', async () => {
    async function fetchWithRetry(fn: () => Promise<any>, maxRetries = 3) {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          if (i === maxRetries - 1) throw error;
        }
      }
    }

    const apiCall = vi.fn();

    // 2回失敗、3回目で成功
    apiCall
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce({ data: 'success' });

    const result = await fetchWithRetry(apiCall);

    expect(result.data).toBe('success');
    expect(apiCall).toHaveBeenCalledTimes(3);
  });

  it('条件分岐によるモック', async () => {
    const fetchUser = vi.fn();

    fetchUser.mockImplementation(async (userId: number) => {
      if (userId === 999) {
        throw new Error('ユーザーが見つかりません');
      }

      if (userId === 1) {
        return { id: 1, name: '管理者', role: 'admin' };
      }

      return { id: userId, name: `ユーザー${userId}`, role: 'user' };
    });

    // 管理者
    const admin = await fetchUser(1);
    expect(admin.role).toBe('admin');

    // 通常ユーザー
    const user = await fetchUser(5);
    expect(user.role).toBe('user');

    // エラー
    await expect(fetchUser(999)).rejects.toThrow('ユーザーが見つかりません');
  });
});

// =====================================
// 実践例: 完全なAPIクライアントのテスト
// =====================================

interface User {
  id: number;
  name: string;
  email: string;
}

class ApiClient {
  async fetchUser(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error('ユーザーの取得に失敗しました');
    }
    return response.json();
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('ユーザーの作成に失敗しました');
    }
    return response.json();
  }

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('ユーザーの削除に失敗しました');
    }
  }
}

describe('ApiClient - 完全なテスト', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
  });

  describe('fetchUser', () => {
    it('成功ケース - mockResolvedValue', async () => {
      const mockUser: User = {
        id: 1,
        name: '田中太郎',
        email: 'tanaka@example.com',
      };

      vi.spyOn(client, 'fetchUser').mockResolvedValue(mockUser);

      const user = await client.fetchUser(1);

      expect(user).toEqual(mockUser);
      expect(client.fetchUser).toHaveBeenCalledWith(1);
    });

    it('エラーケース - mockRejectedValue', async () => {
      vi.spyOn(client, 'fetchUser').mockRejectedValue(
        new Error('ユーザーの取得に失敗しました')
      );

      await expect(client.fetchUser(999)).rejects.toThrow(
        'ユーザーの取得に失敗しました'
      );
    });
  });

  describe('createUser', () => {
    it('成功ケース', async () => {
      const newUser = {
        name: '佐藤花子',
        email: 'sato@example.com',
      };

      const createdUser: User = {
        id: 2,
        ...newUser,
      };

      vi.spyOn(client, 'createUser').mockResolvedValue(createdUser);

      const result = await client.createUser(newUser);

      expect(result.id).toBe(2);
      expect(result.name).toBe('佐藤花子');
    });

    it('エラーケース', async () => {
      vi.spyOn(client, 'createUser').mockRejectedValue(
        new Error('ユーザーの作成に失敗しました')
      );

      await expect(
        client.createUser({ name: 'Test', email: 'test@example.com' })
      ).rejects.toThrow('ユーザーの作成に失敗しました');
    });
  });

  describe('deleteUser', () => {
    it('成功ケース - mockResolvedValue (void)', async () => {
      vi.spyOn(client, 'deleteUser').mockResolvedValue(undefined);

      await expect(client.deleteUser(1)).resolves.toBeUndefined();
      expect(client.deleteUser).toHaveBeenCalledWith(1);
    });

    it('エラーケース', async () => {
      vi.spyOn(client, 'deleteUser').mockRejectedValue(
        new Error('ユーザーの削除に失敗しました')
      );

      await expect(client.deleteUser(1)).rejects.toThrow(
        'ユーザーの削除に失敗しました'
      );
    });
  });
});

// =====================================
// mockReturnValue と mockResolvedValue の違い
// =====================================

describe('mockReturnValue vs mockResolvedValue', () => {
  it('mockReturnValue は即座に値を返す', () => {
    const fn = vi.fn();
    fn.mockReturnValue(42);

    const result = fn();
    expect(result).toBe(42); // すぐに42が返る
    expect(result).not.toBeInstanceOf(Promise);
  });

  it('mockResolvedValue は Promise を返す', async () => {
    const fn = vi.fn();
    fn.mockResolvedValue(42);

    const result = fn();
    expect(result).toBeInstanceOf(Promise); // Promiseが返る

    const value = await result;
    expect(value).toBe(42); // awaitすると42が取得できる
  });

  it('非同期関数には mockResolvedValue を使う', async () => {
    const syncFn = vi.fn();
    const asyncFn = vi.fn();

    // 同期関数
    syncFn.mockReturnValue('sync result');
    expect(syncFn()).toBe('sync result');

    // 非同期関数
    asyncFn.mockResolvedValue('async result');
    expect(await asyncFn()).toBe('async result');
  });
});

// =====================================
// よくある間違いと正しい使い方
// =====================================

describe('よくある間違いと正しい使い方', () => {
  it('❌ 非同期関数に mockReturnValue を使うのは避ける', async () => {
    const asyncFn = vi.fn();

    // これは動くが推奨されない
    asyncFn.mockReturnValue({ data: 'test' });
    
    // Promiseではなく値が直接返る
    const result = await asyncFn();
    expect(result.data).toBe('test');
  });

  it('✅ 非同期関数には mockResolvedValue を使う', async () => {
    const asyncFn = vi.fn();

    // 正しい方法
    asyncFn.mockResolvedValue({ data: 'test' });
    
    const result = await asyncFn();
    expect(result.data).toBe('test');
  });

  it('❌ mockReturnValue の後に mockReturnValueOnce', () => {
    const fn = vi.fn();

    fn.mockReturnValue(0);
    fn.mockReturnValueOnce(1); // これは無視される

    expect(fn()).toBe(0); // 1ではなく0が返る
  });

  it('✅ 正しい順序でチェーン', () => {
    const fn = vi.fn();

    fn.mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValue(0);

    expect(fn()).toBe(1);
    expect(fn()).toBe(2);
    expect(fn()).toBe(0);
  });

  it('✅ テスト後はモックをクリア', () => {
    const fn = vi.fn();

    fn.mockReturnValue('first value');
    expect(fn()).toBe('first value');

    // クリア
    fn.mockClear();

    // 新しい値を設定
    fn.mockReturnValue('second value');
    expect(fn()).toBe('second value');
  });
});
