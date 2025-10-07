# 🚀 デプロイメントガイド

このガイドでは、長野県奈良井旅行アプリを無料でデプロイする手順を説明します。

## 📋 必要なアカウント

以下の無料アカウントを作成してください：

1. **Vercel** (フロントエンド) - https://vercel.com
2. **Render** (バックエンド) - https://render.com
3. **GitHub** (ソースコード管理) - 既に使用中
4. **Supabase** (データベース) - 既に使用中

---

## 🎯 STEP 1: GitHub にプッシュ

### 1-1. 現在の状態を確認

```bash
cd /Users/siro/Desktop/naganoTravel
git status
```

### 1-2. 変更をコミット

```bash
git add .
git commit -m "feat: モダンUIデザインの実装完了"
git push origin main
```

---

## 🌐 STEP 2: フロントエンドのデプロイ（Vercel）

### 2-1. Vercel アカウントの作成

1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. GitHub アカウントで登録

### 2-2. プロジェクトのインポート

1. Vercel ダッシュボードで「Add New...」→「Project」
2. GitHub リポジトリ「naganoTravel」を選択
3. 以下の設定を行う：

**Framework Preset:** Create React App
**Root Directory:** `client`
**Build Command:** `npm run build`
**Output Directory:** `build`

### 2-3. 環境変数の設定

Environment Variables に以下を追加：

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

※ バックエンドのデプロイ後に更新

### 2-4. デプロイ

「Deploy」ボタンをクリック

---

## 🖥️ STEP 3: バックエンドのデプロイ（Render）

### 3-1. Render アカウントの作成

1. https://render.com にアクセス
2. 「Get Started」をクリック
3. GitHub アカウントで登録

### 3-2. Web Service の作成

1. ダッシュボードで「New +」→「Web Service」
2. GitHub リポジトリ「naganoTravel」を選択
3. 以下の設定を行う：

**Name:** `nagano-travel-api`
**Region:** Singapore（最も近いリージョン）
**Root Directory:** `server`
**Runtime:** Node
**Build Command:** `npm install && npm run build`
**Start Command:** `npm start`
**Instance Type:** Free

### 3-3. 環境変数の設定

Environment Variables に以下を追加：

```
DATABASE_URL=postgresql://postgres.bpcrgfudgqzapcxcxnsg:6R*RU#SHh$RNCzE@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
NODE_ENV=production
PORT=3003
```

### 3-4. デプロイ

「Create Web Service」をクリック

---

## 🔄 STEP 4: フロントエンドの環境変数を更新

バックエンドのデプロイが完了したら：

1. Render からバックエンドの URL をコピー
   例: `https://nagano-travel-api.onrender.com`

2. Vercel の設定で環境変数を更新：

   ```
   REACT_APP_API_URL=https://nagano-travel-api.onrender.com/api
   ```

3. Vercel で再デプロイ（自動的に実行されます）

---

## ✅ STEP 5: 動作確認

### 5-1. フロントエンドにアクセス

Vercel が提供する URL にアクセス：
例: `https://nagano-travel.vercel.app`

### 5-2. 機能テスト

- ホームページの表示
- 旅行プラン作成
- 宿泊施設登録
- 観光地登録

---

## 🎉 完了！

これで旅行中にスマホからアクセスできるようになりました！

### 📱 スマホでのアクセス方法

1. Vercel の URL をブラウザで開く
2. ホーム画面に追加（PWA 対応）
3. いつでもどこでもアクセス可能

---

## 💡 代替案（より簡単）

### オプション 1: Vercel のみでデプロイ

**メリット:**

- セットアップが最も簡単
- フロントエンドとバックエンドを同時デプロイ

**手順:**

1. `server`と`client`を同じ Vercel プロジェクトにデプロイ
2. Vercel Serverless Functions を使用
3. 環境変数の設定のみ

### オプション 2: Railway（フルスタック）

**メリット:**

- フロントエンドとバックエンドを 1 つのプラットフォームで管理
- PostgreSQL データベースも提供

**手順:**

1. https://railway.app にアクセス
2. GitHub リポジトリを接続
3. 環境変数を設定
4. 自動デプロイ

---

## 🔧 トラブルシューティング

### デプロイが失敗する場合

**ビルドエラー:**

```bash
# ローカルでビルドテスト
cd client
npm run build
```

**環境変数エラー:**

- Vercel/Render で環境変数が正しく設定されているか確認
- URL に特殊文字がある場合は URL エンコード

**CORS エラー:**

- バックエンドの CORS 設定を確認
- フロントエンドの URL を許可リストに追加

---

## 📝 次のステップ

1. カスタムドメインの設定（任意）
2. HTTPS の自動設定（Vercel/Render 自動）
3. 継続的デプロイの設定（自動）

どの方法でデプロイしますか？Vercel + Render の組み合わせが最もお勧めです！
