# 長野県奈良井旅行のしおり

10 月 11 日〜12 日の長野県奈良井旅行のためのモダンな旅のしおりサイトです。

## 技術スタック

- **フロントエンド**: React + TypeScript + Tailwind CSS
- **バックエンド**: Node.js + TypeScript + Express
- **データベース**: PostgreSQL + Sequelize
- **クラウド DB**: ElephantSQL
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest

## プロジェクト構成

```
naganoTravel/
├── client/          # React フロントエンド
├── server/          # Node.js バックエンド
├── package.json     # ルートのpackage.json
└── README.md
```

## セットアップ

1. リポジトリのクローン

```bash
git clone <your-repo-url>
cd naganoTravel
```

2. 依存関係のインストール

```bash
npm run install:all
```

3. 環境変数の設定

```bash
# server/env.local ファイルを作成し、データベース接続情報を設定
cp server/env.example server/env.local
# env.localファイルを編集してDATABASE_URLを設定
```

4. 開発サーバーの起動

```bash
npm run dev
```

## 機能

- 旅行日程の管理
- 観光地情報の表示
- 宿泊施設の管理
- 交通手段の記録
- 予算管理
- 写真・メモの保存

## 旅行情報

- **日程**: 2024 年 10 月 11 日〜12 日
- **目的地**: 長野県奈良井
- **目的**: 観光・体験
