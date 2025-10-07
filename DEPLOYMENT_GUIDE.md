# 🚀 デプロイメント実行ガイド

## 📋 事前準備（完了済み）

- ✅ Supabase データベース設定済み
- ✅ フロントエンド・バックエンド開発完了
- ✅ モダン UI デザイン実装完了
- ✅ GitHub リポジトリ作成済み

---

## 🎯 デプロイメント手順（無料）

### **方法 1: Vercel + Render（推奨）**

#### 📦 **STEP 1: GitHub に最新コードをプッシュ**

```bash
cd /Users/siro/Desktop/naganoTravel
git add .
git commit -m "feat: デプロイメント設定完了"
git push origin main
```

#### 🌐 **STEP 2: フロントエンドを Vercel にデプロイ**

1. **Vercel アカウント作成**

   - https://vercel.com にアクセス
   - 「Sign Up」→ GitHub で登録

2. **プロジェクトインポート**

   - 「Add New...」→「Project」
   - `naganoTravel`リポジトリを選択

3. **設定**

   ```
   Framework Preset: Create React App
   Root Directory: client
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **環境変数設定**

   ```
   REACT_APP_API_URL=(後で設定)
   ```

5. **Deploy** をクリック

#### 🖥️ **STEP 3: バックエンドを Render にデプロイ**

1. **Render アカウント作成**

   - https://render.com にアクセス
   - 「Get Started」→ GitHub で登録

2. **Web Service 作成**

   - 「New +」→「Web Service」
   - `naganoTravel`リポジトリを選択

3. **設定**

   ```
   Name: nagano-travel-api
   Region: Singapore
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **環境変数設定**

   ```
   DATABASE_URL=postgresql://postgres.bpcrgfudgqzapcxcxnsg:6R*RU#SHh$RNCzE@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
   NODE_ENV=production
   PORT=3003
   FRONTEND_URL=(VercelのURLを後で設定)
   CLIENT_URL=(VercelのURLを後で設定)
   ```

5. **Create Web Service** をクリック

#### 🔄 **STEP 4: 環境変数の相互設定**

1. **Render からバックエンド URL を取得**

   - 例: `https://nagano-travel-api.onrender.com`

2. **Vercel でフロントエンド URL を取得**

   - 例: `https://nagano-travel.vercel.app`

3. **Vercel の環境変数を更新**

   ```
   REACT_APP_API_URL=https://nagano-travel-api.onrender.com/api
   ```

   - 「Redeploy」をクリック

4. **Render の環境変数を更新**
   ```
   FRONTEND_URL=https://nagano-travel.vercel.app
   CLIENT_URL=https://nagano-travel.vercel.app
   ```
   - 自動で再デプロイされます

#### ✅ **STEP 5: 動作確認**

1. Vercel の URL にアクセス
2. 旅行プランを作成してみる
3. データが保存されるか確認

---

### **方法 2: Railway（より簡単）**

#### 🚂 **Railway デプロイ手順**

1. **Railway アカウント作成**

   - https://railway.app にアクセス
   - GitHub で登録

2. **新規プロジェクト作成**

   - 「New Project」→「Deploy from GitHub repo」
   - `naganoTravel`を選択

3. **サービスの追加**

   - 自動的にフロントエンドとバックエンドを検出
   - 環境変数を設定

4. **環境変数（バックエンド）**

   ```
   DATABASE_URL=your_supabase_url
   NODE_ENV=production
   ```

5. **デプロイ完了**
   - 自動的に URL が発行されます

---

## 📱 PWA 対応（スマホアプリ風に）

### **manifest.json の更新**

フロントエンドの`public/manifest.json`を更新：

```json
{
  "short_name": "奈良井旅行",
  "name": "長野県奈良井旅行のしおり",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#ffffff"
}
```

これでスマホのホーム画面に追加できます！

---

## 💰 無料プランの制限

### **Vercel（フロントエンド）**

- ✅ 無制限のサイト
- ✅ 自動 HTTPS
- ✅ カスタムドメイン
- ⚠️ 月 100GB の帯域幅

### **Render（バックエンド）**

- ✅ 750 時間/月の稼働時間
- ✅ 自動 HTTPS
- ⚠️ 15 分間アクセスがないとスリープ
- ⚠️ スリープ解除に 30 秒程度かかる

### **Supabase（データベース）**

- ✅ 500MB のデータベース
- ✅ 無制限の API リクエスト
- ✅ 2GB のファイルストレージ

---

## 🔧 トラブルシューティング

### **ビルドエラーが出る場合**

```bash
# ローカルでビルドテスト
cd client
npm run build

cd ../server
npm run build
```

### **CORS エラーが出る場合**

バックエンドの環境変数に正しいフロントエンド URL を設定

### **データベース接続エラー**

Supabase の接続文字列を確認（特殊文字の URL エンコード）

---

## 🎉 デプロイ完了後

デプロイが完了すると、以下の URL でアクセスできます：

- **フロントエンド**: `https://nagano-travel.vercel.app`
- **バックエンド API**: `https://nagano-travel-api.onrender.com`

スマホのブラウザでフロントエンド URL を開き、「ホーム画面に追加」すればアプリのように使えます！

---

どの方法でデプロイしますか？

1. **Vercel + Render**（推奨・一番安定）
2. **Railway**（一番簡単）
