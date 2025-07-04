# 五目並べ オンライン

リアルタイムマルチプレイヤー五目並べゲームアプリケーション。合言葉（パスワード）によるルーム管理システムで、同じ合言葉を入力したプレイヤー同士がマッチングして対戦できます。

## 機能

- 🎮 **リアルタイム対戦**: Socket.IOを使用した即座の石の配置と状態同期
- 🔐 **合言葉システム**: 自由に設定できる合言葉でルームを作成・参加
- 🎯 **五目並べルール**: 15x15のボードで5つ並べて勝利
- 📱 **レスポンシブデザイン**: スマートフォンからデスクトップまで対応
- 🎨 **直感的UI**: 美しいゲーム盤とわかりやすい操作

## 技術スタック

- **フロントエンド**: React 19.1.0 + TypeScript + Vite
- **バックエンド**: Node.js + Express + Socket.IO
- **スタイリング**: Tailwind CSS
- **デプロイ**: Render対応

## 遊び方

1. **プレイヤー名を入力**
2. **ルーム名と合言葉を設定**（同じ合言葉のプレイヤーとマッチング）
3. **2人揃ったら「準備完了」を押す**
4. **交互に石を置いて5つ並べる**
5. **勝利したら「もう一度プレイ」でリセット**

## 開発環境での起動方法

### 1. 依存関係をインストール
```bash
npm install
```

### 2. サーバーをコンパイル
```bash
mkdir -p dist
npx tsc server/index.ts --outDir dist --module commonjs --target es2020 --esModuleInterop --skipLibCheck
```

### 3. バックエンドサーバーを起動
```bash
node dist/index.js
```

### 4. フロントエンドサーバーを起動（別ターミナル）
```bash
npx vite --host 0.0.0.0 --port 3000
```

### 5. ブラウザでアクセス
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:3001

## Renderでのデプロイ方法

1. **GitHubリポジトリにプッシュ**
2. **Renderダッシュボードで新しいWebサービスを作成**
3. **GitHub接続してリポジトリを選択**
4. **render.yamlファイルを使用してデプロイ**

または手動設定：
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: `NODE_ENV=production`

## プロジェクト構造

```
├── server/
│   └── index.ts          # Socket.IOサーバーとExpress API
├── src/
│   ├── components/
│   │   ├── JoinRoom.tsx  # ルーム参加フォーム
│   │   ├── GameBoard.tsx # 五目並べゲーム盤
│   │   └── PlayerList.tsx # プレイヤー一覧
│   ├── App.tsx           # メインアプリケーション
│   ├── App.css           # スタイルシート
│   └── main.tsx          # Reactエントリーポイント
├── index.html            # HTMLテンプレート
├── render.yaml           # Renderデプロイ設定
└── README.md             # このファイル
```

## Socket.IOイベント

### クライアント → サーバー
- `join-room`: ルーム参加リクエスト
- `player-ready`: プレイヤー準備完了
- `make-move`: 石を置く
- `reset-game`: ゲームリセット

### サーバー → クライアント
- `room-update`: ルーム状態更新
- `game-start`: ゲーム開始
- `game-update`: ゲーム盤状態更新
- `game-end`: ゲーム終了
- `join-error`: エラー通知

## ライセンス

ISC License