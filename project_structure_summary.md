# todolist ディレクトリ構成・概要まとめ

## ルート直下
- `.env.local`: 環境変数ファイル
- `.gitignore`: Git管理対象外ファイル定義
- `.next/`: Next.js のビルド成果物ディレクトリ
- `README.md`: プロジェクト説明ファイル
- `next-env.d.ts`: TypeScript用Next.js型定義
- `next.config.ts`: Next.js 設定ファイル
- `node_modules/`: 依存パッケージ
- `package-lock.json`, `package.json`: npm管理ファイル
- `postcss.config.mjs`: PostCSS設定
- `public/`: 静的ファイル格納ディレクトリ
- `src/`: ソースコードディレクトリ
- `tsconfig.json`: TypeScript 設定ファイル

## `src` ディレクトリ
- `app/`: Next.js App Router構成のメインディレクトリ
  - `LoginHeader.tsx`: ログインヘッダーコンポーネント
  - `SessionWrapper.tsx`: セッション管理用ラッパー
  - `auth-page.tsx`, `auth-test.tsx`: 認証関連ページ
  - `favicon.ico`: アイコン
  - `globals.css`: グローバルCSS
  - `layout.tsx`: レイアウト
  - `page.tsx`: トップページ
  - `todo.tsx`: TODOリストページ
  - `api/`: APIエンドポイント
    - `auth/`: 認証API
    - `calendar/`: カレンダーAPI
      - `add.ts`: カレンダー追加API
      - `delete.ts`: カレンダー削除API
      - `update.ts`: カレンダー更新API

## 備考
- APIルートは `src/app/api/` 以下に配置されており、`calendar` ディレクトリには `add.ts`・`delete.ts`・`update.ts` の3つのAPIが存在します。
- Next.js App Router 構成で、TypeScriptベースで開発されています。
- 認証・カレンダー・TODO管理機能が備わっている構成です。
