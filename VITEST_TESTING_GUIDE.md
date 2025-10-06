# Vitest 単体テスト実践ガイド

## 目次

1. [Vitest とは](#vitestとは)
2. [セットアップ](#セットアップ)
3. [基本的なテストの書き方](#基本的なテストの書き方)
4. [React コンポーネントのテスト](#react-コンポーネントのテスト)
5. [API・サービス層のテスト](#apiサービス層のテスト)
6. [データベース関連のテスト](#データベース関連のテスト)
7. [モックとスタブ](#モックとスタブ)
8. [テストのベストプラクティス](#テストのベストプラクティス)
9. [よく使うマッチャー](#よく使うマッチャー)
10. [デバッグとトラブルシューティング](#デバッグとトラブルシューティング)

## Vitest とは

Vitest は、Vite ベースの高速なテストランナーです。Jest と互換性がありながら、より高速で、TypeScript をネイティブサポートしています。

### Jest との主な違い

- **高速**: Vite の高速なバンドリングを活用
- **TypeScript**: 設定不要で TypeScript をサポート
- **ESM**: ES Modules をネイティブサポート
- **Watch Mode**: ファイル変更時の自動再実行

## セットアップ

### 1. インストール

```bash
# プロジェクトにvitestを追加
npm install -D vitest @vitest/ui

# React Testing Library（Reactコンポーネントテスト用）
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# その他の有用なライブラリ
npm install -D jsdom @types/node
```

### 2. 設定ファイル（vitest.config.ts）

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*"],
    },
  },
});
```

### 3. セットアップファイル（src/test/setup.ts）

```typescript
import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// カスタムマッチャーの追加
expect.extend(matchers);

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});
```

### 4. package.json のスクリプト追加

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 基本的なテストの書き方

### 基本的なテスト構造

```typescript
import { describe, it, expect } from "vitest";

describe("関数名またはコンポーネント名", () => {
  it("テストケースの説明", () => {
    // Arrange（準備）
    const input = "test";

    // Act（実行）
    const result = functionToTest(input);

    // Assert（検証）
    expect(result).toBe("expected");
  });
});
```

### テストの種類

```typescript
// 1. 正常系テスト
it("正常な入力に対して期待される結果を返す", () => {
  expect(add(2, 3)).toBe(5);
});

// 2. 異常系テスト
it("無効な入力に対してエラーを投げる", () => {
  expect(() => divide(10, 0)).toThrow("ゼロで割ることはできません");
});

// 3. 境界値テスト
it("境界値で正しく動作する", () => {
  expect(isValidAge(0)).toBe(false);
  expect(isValidAge(120)).toBe(false);
  expect(isValidAge(18)).toBe(true);
});
```

## React コンポーネントのテスト

### 基本的なコンポーネントテスト

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Button from "../components/Button";

describe("Button", () => {
  it("ボタンが正しくレンダリングされる", () => {
    render(<Button>クリック</Button>);

    const button = screen.getByRole("button", { name: "クリック" });
    expect(button).toBeInTheDocument();
  });

  it("クリックイベントが正しく動作する", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### フォームコンポーネントのテスト

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import LoginForm from "../components/LoginForm";

describe("LoginForm", () => {
  it("フォーム送信が正しく動作する", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    // フォーム入力
    await user.type(
      screen.getByLabelText(/メールアドレス/i),
      "test@example.com"
    );
    await user.type(screen.getByLabelText(/パスワード/i), "password123");

    // 送信ボタンクリック
    await user.click(screen.getByRole("button", { name: /ログイン/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("バリデーションエラーが表示される", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    // 空の状態で送信
    await user.click(screen.getByRole("button", { name: /ログイン/i }));

    expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument();
  });
});
```

### 非同期コンポーネントのテスト

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import UserProfile from "../components/UserProfile";

// APIモック
vi.mock("../services/api", () => ({
  fetchUser: vi.fn(),
}));

describe("UserProfile", () => {
  it("ユーザー情報が正しく表示される", async () => {
    const mockUser = {
      id: 1,
      name: "テストユーザー",
      email: "test@example.com",
    };

    // APIモックの設定
    const { fetchUser } = await import("../services/api");
    vi.mocked(fetchUser).mockResolvedValue(mockUser);

    render(<UserProfile userId={1} />);

    // ローディング状態の確認
    expect(screen.getByText(/読み込み中.../i)).toBeInTheDocument();

    // データが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
```

## API・サービス層のテスト

### API サービスのテスト

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { apiService } from "../services/api";

// axiosのモック
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GETリクエストが正しく実行される", async () => {
    const mockData = { id: 1, name: "テスト" };
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await apiService.get("/users/1");

    expect(mockedAxios.get).toHaveBeenCalledWith("/users/1");
    expect(result).toEqual(mockData);
  });

  it("POSTリクエストが正しく実行される", async () => {
    const mockData = { name: "新しいユーザー" };
    const responseData = { id: 2, ...mockData };
    mockedAxios.post.mockResolvedValue({ data: responseData });

    const result = await apiService.post("/users", mockData);

    expect(mockedAxios.post).toHaveBeenCalledWith("/users", mockData);
    expect(result).toEqual(responseData);
  });

  it("エラーハンドリングが正しく動作する", async () => {
    const errorMessage = "ネットワークエラー";
    mockedAxios.get.mockRejectedValue(new Error(errorMessage));

    await expect(apiService.get("/users/1")).rejects.toThrow(errorMessage);
  });
});
```

### ビジネスロジックのテスト

```typescript
import { describe, it, expect } from "vitest";
import {
  calculateTotalPrice,
  validateEmail,
  formatDate,
} from "../utils/helpers";

describe("Helper Functions", () => {
  describe("calculateTotalPrice", () => {
    it("基本料金が正しく計算される", () => {
      const items = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 1 },
      ];

      expect(calculateTotalPrice(items)).toBe(250);
    });

    it("空の配列で0を返す", () => {
      expect(calculateTotalPrice([])).toBe(0);
    });
  });

  describe("validateEmail", () => {
    it("有効なメールアドレスを正しく判定する", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.jp")).toBe(true);
    });

    it("無効なメールアドレスを正しく判定する", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
    });
  });
});
```

## データベース関連のテスト

### モデルのテスト

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { sequelize } from "../config/database";
import { User } from "../models/User";

describe("User Model", () => {
  beforeEach(async () => {
    // テスト用のデータベースをクリーンアップ
    await User.destroy({ where: {} });
  });

  afterEach(async () => {
    // テスト後のクリーンアップ
    await User.destroy({ where: {} });
  });

  it("ユーザーが正しく作成される", async () => {
    const userData = {
      name: "テストユーザー",
      email: "test@example.com",
      password: "password123",
    };

    const user = await User.create(userData);

    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });

  it("重複するメールアドレスでエラーが発生する", async () => {
    const userData = {
      name: "テストユーザー",
      email: "test@example.com",
      password: "password123",
    };

    await User.create(userData);

    await expect(User.create(userData)).rejects.toThrow();
  });
});
```

### コントローラーのテスト

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { createUser, getUserById } from "../controllers/userController";

describe("User Controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: vi.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  it("ユーザー作成が成功する", async () => {
    mockReq.body = {
      name: "テストユーザー",
      email: "test@example.com",
      password: "password123",
    };

    await createUser(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(Number),
        name: "テストユーザー",
        email: "test@example.com",
      })
    );
  });

  it("無効なデータでエラーが発生する", async () => {
    mockReq.body = {
      name: "",
      email: "invalid-email",
      password: "123",
    };

    await createUser(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
```

## モックとスタブ

### 関数のモック

```typescript
import { describe, it, expect, vi } from "vitest";

// 外部関数のモック
const mockFunction = vi.fn();

describe("Mock Examples", () => {
  it("関数の呼び出しをモックする", () => {
    mockFunction.mockReturnValue("mocked value");

    const result = mockFunction();
    expect(result).toBe("mocked value");
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("非同期関数をモックする", async () => {
    mockFunction.mockResolvedValue("async result");

    const result = await mockFunction();
    expect(result).toBe("async result");
  });

  it("エラーを投げる関数をモックする", () => {
    mockFunction.mockImplementation(() => {
      throw new Error("Mock error");
    });

    expect(() => mockFunction()).toThrow("Mock error");
  });
});
```

### モジュールのモック

```typescript
import { describe, it, expect, vi } from "vitest";

// モジュール全体をモック
vi.mock("../services/api", () => ({
  fetchData: vi.fn(),
  postData: vi.fn(),
}));

// 部分的なモック
vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    get: vi.fn(),
    post: vi.fn(),
  };
});
```

### タイマーのモック

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Timer Mock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("setTimeoutをモックする", () => {
    const callback = vi.fn();

    setTimeout(callback, 1000);

    // 時間を進める
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
  });
});
```

## テストのベストプラクティス

### 1. テストの構造（AAA パターン）

```typescript
it("テストケースの説明", () => {
  // Arrange（準備）: テストに必要なデータや状態を準備
  const input = "test input";
  const expected = "expected output";

  // Act（実行）: テスト対象の関数やメソッドを実行
  const result = functionToTest(input);

  // Assert（検証）: 結果を検証
  expect(result).toBe(expected);
});
```

### 2. テストの独立性

```typescript
describe("Independent Tests", () => {
  // 各テストは独立しているべき
  beforeEach(() => {
    // テストごとにクリーンな状態を準備
  });

  afterEach(() => {
    // テスト後のクリーンアップ
  });
});
```

### 3. テスト名の書き方

```typescript
// ❌ 悪い例
it("test1", () => {});
it("should work", () => {});

// ✅ 良い例
it("有効なメールアドレスに対してtrueを返す", () => {});
it("空の配列に対して0を返す", () => {});
it("ネットワークエラー時に適切なエラーメッセージを表示する", () => {});
```

### 4. テストデータの管理

```typescript
// テストデータを定数として定義
const VALID_USER_DATA = {
  name: "テストユーザー",
  email: "test@example.com",
  password: "password123",
};

const INVALID_USER_DATA = {
  name: "",
  email: "invalid-email",
  password: "123",
};

describe("User Registration", () => {
  it("有効なデータでユーザーが作成される", () => {
    // VALID_USER_DATAを使用
  });

  it("無効なデータでエラーが発生する", () => {
    // INVALID_USER_DATAを使用
  });
});
```

## よく使うマッチャー

### 基本的なマッチャー

```typescript
// 値の比較
expect(value).toBe(expected); // 厳密等価
expect(value).toEqual(expected); // 深い等価
expect(value).toBeNull(); // null
expect(value).toBeUndefined(); // undefined
expect(value).toBeDefined(); // 定義されている
expect(value).toBeTruthy(); // truthy
expect(value).toBeFalsy(); // falsy

// 数値の比較
expect(value).toBeGreaterThan(3); // より大きい
expect(value).toBeGreaterThanOrEqual(3); // 以上
expect(value).toBeLessThan(5); // より小さい
expect(value).toBeLessThanOrEqual(5); // 以下
expect(value).toBeCloseTo(0.3); // 浮動小数点の近似

// 文字列の比較
expect(string).toMatch(/pattern/); // 正規表現
expect(string).toContain("substring"); // 部分文字列
expect(string).toHaveLength(5); // 長さ

// 配列の比較
expect(array).toContain(item); // 要素を含む
expect(array).toHaveLength(3); // 長さ
expect(array).toEqual(expect.arrayContaining([1, 2])); // 部分配列

// オブジェクトの比較
expect(object).toHaveProperty("key"); // プロパティを持つ
expect(object).toHaveProperty("key", "value"); // プロパティの値
expect(object).toEqual(expect.objectContaining({ key: "value" })); // 部分オブジェクト
```

### 非同期テストのマッチャー

```typescript
// Promise
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow(error);

// 関数の呼び出し
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledTimes(3);
expect(mockFunction).toHaveBeenCalledWith(arg1, arg2);
expect(mockFunction).toHaveBeenLastCalledWith(arg1, arg2);
```

## デバッグとトラブルシューティング

### 1. デバッグ出力

```typescript
it("デバッグ情報を出力する", () => {
  const result = complexFunction();

  // デバッグ情報を出力
  console.log("Result:", result);
  console.table(result);

  expect(result).toBeDefined();
});
```

### 2. テストのスキップ

```typescript
// 特定のテストをスキップ
it.skip("スキップされるテスト", () => {
  // このテストは実行されない
});

// 条件付きスキップ
it("条件付きスキップ", () => {
  if (process.env.NODE_ENV === "production") {
    return; // 本番環境ではスキップ
  }

  // テスト内容
});
```

### 3. よくある問題と解決方法

```typescript
// 問題: 非同期処理の待機
it("非同期処理を正しく待機する", async () => {
  // ❌ 間違い
  // expect(result).toBe(expected) // まだ完了していない

  // ✅ 正しい
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

// 問題: モックのリセット
beforeEach(() => {
  vi.clearAllMocks(); // モックをリセット
});

// 問題: タイマーの処理
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

## まとめ

Vitest を使った単体テストでは以下のポイントが重要です：

1. **適切なセットアップ**: プロジェクトに合わせた設定
2. **テストの構造化**: AAA パターンの活用
3. **モックの活用**: 外部依存の適切なモック
4. **非同期処理**: 適切な待機とエラーハンドリング
5. **保守性**: 読みやすく、独立したテスト

これらのパターンを活用することで、信頼性の高いテストスイートを構築できます。
