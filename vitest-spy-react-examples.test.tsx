import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// =====================================
// 実践例: Reactコンポーネントのテスト
// =====================================

// サンプルコンポーネント1: フォーム
interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  onError?: (error: string) => void;
}

function LoginForm({ onSubmit, onError }: LoginFormProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      onError?.('ユーザー名とパスワードを入力してください');
      return;
    }
    onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        data-testid="username-input"
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
      />
      <button type="submit">ログイン</button>
    </form>
  );
}

describe('LoginForm - vi.spyを使ったテスト', () => {
  it('フォーム送信時にonSubmitが呼ばれる', () => {
    // onSubmitコールバックのスパイを作成
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    // フォームに入力
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByText('ログイン');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // スパイで呼び出しを確認
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('testuser', 'password123');
  });

  it('バリデーションエラー時にonErrorが呼ばれる', () => {
    const handleSubmit = vi.fn();
    const handleError = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} onError={handleError} />);

    // 空のまま送信
    const submitButton = screen.getByText('ログイン');
    fireEvent.click(submitButton);

    // エラーハンドラーが呼ばれることを確認
    expect(handleError).toHaveBeenCalledWith('ユーザー名とパスワードを入力してください');
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

// =====================================
// 実践例2: API呼び出しを含むコンポーネント
// =====================================

interface User {
  id: number;
  name: string;
}

interface UserListProps {
  apiClient: {
    fetchUsers: () => Promise<User[]>;
    deleteUser: (id: number) => Promise<void>;
  };
}

function UserList({ apiClient }: UserListProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.fetchUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, [apiClient]);

  const handleDelete = (id: number) => {
    apiClient.deleteUser(id).then(() => {
      setUsers(users.filter((u) => u.id !== id));
    });
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div>
      {users.map((user) => (
        <div key={user.id} data-testid={`user-${user.id}`}>
          <span>{user.name}</span>
          <button onClick={() => handleDelete(user.id)}>削除</button>
        </div>
      ))}
    </div>
  );
}

describe('UserList - API呼び出しのモック', () => {
  it('ユーザー一覧を表示する', async () => {
    const mockUsers: User[] = [
      { id: 1, name: '田中太郎' },
      { id: 2, name: '佐藤花子' },
    ];

    // APIクライアントのスパイを作成
    const mockApiClient = {
      fetchUsers: vi.fn().mockResolvedValue(mockUsers),
      deleteUser: vi.fn().mockResolvedValue(undefined),
    };

    render(<UserList apiClient={mockApiClient} />);

    // 読み込み完了を待つ
    await waitFor(() => {
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
    });

    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    expect(mockApiClient.fetchUsers).toHaveBeenCalledTimes(1);
  });

  it('ユーザー削除が正しく動作する', async () => {
    const mockUsers: User[] = [
      { id: 1, name: '田中太郎' },
      { id: 2, name: '佐藤花子' },
    ];

    const mockApiClient = {
      fetchUsers: vi.fn().mockResolvedValue(mockUsers),
      deleteUser: vi.fn().mockResolvedValue(undefined),
    };

    render(<UserList apiClient={mockApiClient} />);

    // 読み込み完了を待つ
    await waitFor(() => {
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    // 削除APIが呼ばれたことを確認
    await waitFor(() => {
      expect(mockApiClient.deleteUser).toHaveBeenCalledWith(1);
      expect(mockApiClient.deleteUser).toHaveBeenCalledTimes(1);
    });
  });
});

// =====================================
// 実践例3: タイマーとvi.spy
// =====================================

function CountdownTimer({ initialSeconds, onComplete }: {
  initialSeconds: number;
  onComplete: () => void;
}) {
  const [seconds, setSeconds] = React.useState(initialSeconds);

  React.useEffect(() => {
    if (seconds === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setSeconds(seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, onComplete]);

  return <div>残り: {seconds}秒</div>;
}

describe('CountdownTimer - タイマーのテスト', () => {
  beforeEach(() => {
    // タイマーをフェイクタイマーに置き換え
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('カウントダウンが完了したらonCompleteが呼ばれる', () => {
    const handleComplete = vi.fn();

    render(<CountdownTimer initialSeconds={3} onComplete={handleComplete} />);

    expect(screen.getByText('残り: 3秒')).toBeInTheDocument();

    // 1秒進める
    vi.advanceTimersByTime(1000);
    expect(screen.getByText('残り: 2秒')).toBeInTheDocument();

    // さらに2秒進める
    vi.advanceTimersByTime(2000);
    expect(screen.getByText('残り: 0秒')).toBeInTheDocument();

    // onCompleteが呼ばれたことを確認
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});

// =====================================
// 実践例4: ローカルストレージのモック
// =====================================

class StorageService {
  save(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  load(key: string): string | null {
    return localStorage.getItem(key);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}

describe('StorageService - ローカルストレージのモック', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    // localStorageをモック
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'removeItem');
  });

  it('データを保存する', () => {
    storageService.save('username', 'testuser');

    expect(localStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('データを読み込む', () => {
    // モックの戻り値を設定
    vi.mocked(localStorage.getItem).mockReturnValue('testuser');

    const result = storageService.load('username');

    expect(result).toBe('testuser');
    expect(localStorage.getItem).toHaveBeenCalledWith('username');
  });

  it('データを削除する', () => {
    storageService.remove('username');

    expect(localStorage.removeItem).toHaveBeenCalledWith('username');
  });
});

// =====================================
// 実践例5: axiosのモック（API呼び出し）
// =====================================

import axios from 'axios';

// axiosをモック
vi.mock('axios');

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

class TodoService {
  async fetchTodos(): Promise<TodoItem[]> {
    const response = await axios.get('/api/todos');
    return response.data;
  }

  async createTodo(title: string): Promise<TodoItem> {
    const response = await axios.post('/api/todos', { title });
    return response.data;
  }
}

describe('TodoService - axiosのモック', () => {
  let todoService: TodoService;

  beforeEach(() => {
    todoService = new TodoService();
    vi.clearAllMocks();
  });

  it('Todoリストを取得する', async () => {
    const mockTodos: TodoItem[] = [
      { id: 1, title: '買い物', completed: false },
      { id: 2, title: '掃除', completed: true },
    ];

    // axios.getをモック
    vi.mocked(axios.get).mockResolvedValue({ data: mockTodos });

    const todos = await todoService.fetchTodos();

    expect(todos).toEqual(mockTodos);
    expect(axios.get).toHaveBeenCalledWith('/api/todos');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('新しいTodoを作成する', async () => {
    const newTodo: TodoItem = { id: 3, title: '料理', completed: false };

    // axios.postをモック
    vi.mocked(axios.post).mockResolvedValue({ data: newTodo });

    const result = await todoService.createTodo('料理');

    expect(result).toEqual(newTodo);
    expect(axios.post).toHaveBeenCalledWith('/api/todos', { title: '料理' });
  });
});
