# Replit Project Documentation

## Overview

リアルタイムマルチプレイヤー五目並べゲームアプリケーション。合言葉（パスワード）によるルーム管理システムで、同じ合言葉を入力したプレイヤー同士でマッチングします。Renderでのデプロイに対応しています。

## System Architecture

**フロントエンド:** React + TypeScript + Vite
**バックエンド:** Node.js + Express + Socket.IO
**デプロイ:** Render対応（render.yamlファイル含む）

技術スタック：
- React 19.1.0でリアルタイムUI
- Socket.IO 4.8.1でリアルタイム通信
- TypeScript完全対応
- Tailwind CSSでスタイリング
- CommonJS形式でサーバー実行

## Key Components

**フロントエンド Components:**
- App.tsx: メインアプリケーションコンポーネント
- JoinRoom.tsx: ルーム参加フォーム
- GameBoard.tsx: 五目並べゲーム盤
- PlayerList.tsx: プレイヤー一覧と状態管理

**バックエンド Components:**
- server/index.ts: Socket.IOサーバーとExpress API
- ルーム管理システム（合言葉ベース）
- ゲーム状態管理（15x15ボード）
- 勝利判定ロジック（5つ並び）

## Data Flow

**リアルタイム通信フロー:**
1. クライアント→サーバー: Socket.IOイベント
   - join-room: ルーム参加リクエスト
   - player-ready: プレイヤー準備完了
   - make-move: 石を置く
   - reset-game: ゲームリセット

2. サーバー→クライアント: Socket.IOイベント
   - room-update: ルーム状態更新
   - game-start: ゲーム開始
   - game-update: ゲーム盤状態更新
   - game-end: ゲーム終了
   - join-error: エラー通知

## External Dependencies

**Current State:** No dependencies defined.

**Common Dependencies to Consider:**
- Package managers (npm, yarn, pip)
- Development tools (bundlers, linters, testing frameworks)
- Third-party APIs and services
- Cloud services for deployment and storage

## Deployment Strategy

**Render対応完了:**
- render.yamlファイル設定済み
- 本番環境用の静的ファイル提供
- NODE_ENV=production環境変数設定
- ビルドコマンド: `npm install && npm run build`
- 起動コマンド: `npm start`

**ローカル開発:**
- バックエンド: `node dist/index.js` (ポート3001)
- フロントエンド: `npx vite --host 0.0.0.0 --port 3000`

## Changelog

Changelog:
- July 04, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.

---

**Note for Code Agent:** This repository is currently empty and requires initial project setup. Begin by determining the project requirements and establishing the basic directory structure, package management, and core architectural decisions based on the intended application type and scope.