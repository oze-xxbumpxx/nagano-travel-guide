import { describe, it, expect, vi, beforeEach } from 'vitest';

// =====================================
// 1. 基本的なvi.spyの使い方
// =====================================

describe('vi.spy - 基本的な使い方', () => {
  it('関数の呼び出しを監視する', () => {
    // オブジェクトのメソッドにスパイを設定
    const calculator = {
      add: (a: number, b: number) => a + b,
    };

    const spy = vi.spyOn(calculator, 'add');

    // 関数を実行
    const result = calculator.add(2, 3);

    // 結果の確認
    expect(result).toBe(5);
    // スパイで呼び出しを確認
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(2, 3);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('スパイで戻り値をモックする', () => {
    const calculator = {
      multiply: (a: number, b: number) => a * b,
    };

    // スパイを作成し、戻り値をモック
    const spy = vi.spyOn(calculator, 'multiply').mockReturnValue(100);

    const result = calculator.multiply(2, 3);

    // モックした戻り値が返される
    expect(result).toBe(100);
    expect(spy).toHaveBeenCalledWith(2, 3);
  });
});

// =====================================
// 2. API呼び出しのモック（実用例）
// =====================================

interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
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

describe('UserService - API呼び出しのモック', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('fetchUserメソッドをスパイしてモックする', async () => {
    const mockUser: User = {
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
    };

    // fetchUserメソッドにスパイを設定し、モックデータを返す
    const spy = vi.spyOn(userService, 'fetchUser').mockResolvedValue(mockUser);

    const user = await userService.fetchUser(1);

    expect(user).toEqual(mockUser);
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('createUserメソッドの呼び出しを監視する', async () => {
    const newUser = {
      name: '佐藤花子',
      email: 'sato@example.com',
    };

    const createdUser: User = { id: 2, ...newUser };

    const spy = vi.spyOn(userService, 'createUser').mockResolvedValue(createdUser);

    const result = await userService.createUser(newUser);

    expect(result.id).toBe(2);
    expect(spy).toHaveBeenCalledWith(newUser);
  });
});

// =====================================
// 3. コールバック関数のスパイ
// =====================================

describe('vi.spy - コールバック関数', () => {
  it('コールバック関数が呼ばれたことを確認', () => {
    // コールバック関数のスパイを作成
    const callback = vi.fn();

    // コールバックを使う関数
    function processData(data: number[], onComplete: (sum: number) => void) {
      const sum = data.reduce((acc, val) => acc + val, 0);
      onComplete(sum);
    }

    processData([1, 2, 3, 4, 5], callback);

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(15);
  });

  it('コールバックの実装をモックする', () => {
    const callback = vi.fn().mockImplementation((value: number) => {
      return value * 2;
    });

    const result = callback(5);

    expect(result).toBe(10);
    expect(callback).toHaveBeenCalledWith(5);
  });
});

// =====================================
// 4. イベントハンドラーのスパイ（React例）
// =====================================

describe('vi.spy - イベントハンドラー', () => {
  it('クリックイベントハンドラーを監視', () => {
    // イベントハンドラーのスパイ
    const handleClick = vi.fn();

    // ボタンコンポーネントのシミュレーション
    const button = {
      onClick: handleClick,
      click: function() {
        this.onClick();
      }
    };

    // クリックをシミュレート
    button.click();
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});

// =====================================
// 5. 連続する呼び出しで異なる値を返す
// =====================================

describe('vi.spy - 連続した呼び出し', () => {
  it('呼び出しごとに異なる値を返す', () => {
    const randomizer = {
      getRandom: () => Math.random(),
    };

    const spy = vi.spyOn(randomizer, 'getRandom')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.9);

    expect(randomizer.getRandom()).toBe(0.1);
    expect(randomizer.getRandom()).toBe(0.5);
    expect(randomizer.getRandom()).toBe(0.9);
    expect(spy).toHaveBeenCalledTimes(3);
  });
});

// =====================================
// 6. スパイのリセットとリストア
// =====================================

describe('vi.spy - リセットとリストア', () => {
  it('mockClearでスパイの呼び出し履歴をクリア', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
    };

    const spy = vi.spyOn(calculator, 'add');

    calculator.add(1, 2);
    expect(spy).toHaveBeenCalledTimes(1);

    // 呼び出し履歴をクリア
    spy.mockClear();

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('mockRestoreで元の実装に戻す', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
    };

    const spy = vi.spyOn(calculator, 'add').mockReturnValue(999);

    expect(calculator.add(1, 2)).toBe(999);

    // 元の実装に戻す
    spy.mockRestore();

    expect(calculator.add(1, 2)).toBe(3);
  });
});

// =====================================
// 7. 非同期関数のスパイ
// =====================================

class AsyncService {
  async delay(ms: number): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(`Waited ${ms}ms`), ms);
    });
  }

  async fetchData(): Promise<{ data: string }> {
    await this.delay(100);
    return { data: 'real data' };
  }
}

describe('vi.spy - 非同期関数', () => {
  it('非同期関数をモックする', async () => {
    const service = new AsyncService();

    // delayメソッドをモックして即座に完了させる
    const delaySpy = vi.spyOn(service, 'delay').mockResolvedValue('mocked');

    const result = await service.delay(1000);

    expect(result).toBe('mocked');
    expect(delaySpy).toHaveBeenCalledWith(1000);
  });

  it('非同期エラーをモックする', async () => {
    const service = new AsyncService();

    const spy = vi.spyOn(service, 'fetchData')
      .mockRejectedValue(new Error('API Error'));

    await expect(service.fetchData()).rejects.toThrow('API Error');
    expect(spy).toHaveBeenCalled();
  });
});

// =====================================
// 8. 引数の詳細な検証
// =====================================

describe('vi.spy - 引数の検証', () => {
  it('特定の引数で呼ばれたことを確認', () => {
    const logger = {
      log: (level: string, message: string, metadata?: object) => {
        console.log(`[${level}] ${message}`, metadata);
      },
    };

    const spy = vi.spyOn(logger, 'log');

    logger.log('INFO', 'User logged in', { userId: 123 });

    // 完全一致
    expect(spy).toHaveBeenCalledWith('INFO', 'User logged in', { userId: 123 });

    // any matcherを使用
    expect(spy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('logged'),
      expect.objectContaining({ userId: 123 })
    );
  });

  it('nth番目の呼び出しを検証', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
    };

    const spy = vi.spyOn(calculator, 'add');

    calculator.add(1, 2);
    calculator.add(3, 4);
    calculator.add(5, 6);

    // 2番目の呼び出しを検証
    expect(spy).toHaveBeenNthCalledWith(2, 3, 4);
  });
});
