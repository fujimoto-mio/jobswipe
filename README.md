# JobSwipe MVP — 求人動画スワイプWebアプリ

TikTok/Reels風の**上下スワイプUI**で求人動画を閲覧・保存・応募できるWebアプリのMVPデモです。  
カバーレター提案内容に沿った構成で実装しています。

## デモの起動方法

```bash
cd jobswipe-mvp
npm install
npm run dev
```

- **求職者画面**: [http://localhost:3000](http://localhost:3000)
- **管理者画面**: [http://localhost:3000/admin](http://localhost:3000/admin)

スマホサイズ（375px幅）での表示が最適です。

## MVP構成（提案内容）

### 求職者側
| 機能 | 説明 |
|------|------|
| 動画一覧表示 | TikTok風フルスクリーン縦フィード |
| 上下スワイプ | 上スワイプで次の求人へ |
| 求人詳細表示 | モーダルで仕事内容・条件・福利厚生 |
| 保存 | ❤️ボタンで気になる求人を保存 |
| 応募ボタン | 応募フォームから送信 |

### 管理者側
| 機能 | 説明 |
|------|------|
| 求人登録 | タイトル・会社・動画URL等を入力 |
| 動画アップロード | ファイル選択（MVP: プレビュー / 本番: Supabase Storage） |
| 応募管理 | 応募一覧・ステータス変更 |

## 想定UIフロー

```
動画表示 → 上下スワイプ → 次の求人 → ❤️保存 → 応募
```

## 推奨技術構成

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js + TypeScript |
| Backend | Supabase |
| Database | PostgreSQL (Supabase) |
| Storage | Supabase Storage（求人動画） |
| Auth | Supabase Auth |

MVPデモはインメモリストアを使用。`.env.example` を参考にSupabase接続可能。

## API エンドポイント

```
GET  /api/jobs              求人一覧
POST /api/jobs              求人登録（管理者）
GET  /api/saves             保存した求人
POST /api/saves             保存トグル { jobId }
GET  /api/applications      応募一覧
POST /api/applications      応募送信 { jobId, message }
PATCH /api/applications     ステータス更新 { id, status }
GET  /api/admin/stats       管理ダッシュボード統計
POST /api/reset             デモリセット
```

## ミーティングでのデモ手順

1. **求職者画面** — 動画が自動再生。上スワイプで次の求人
2. **保存** — ❤️ボタンで保存 →「保存」タブで確認
3. **詳細・応募** — 詳細ボタン → 応募フォーム送信
4. **管理者画面** — `/admin` で求人登録・応募管理を実演
5. **技術構成** — Supabase構成と `database/schema.sql` を説明

## MVP成功後の拡張

- お気に入り機能（実装済み → レコメンド連携）
- レコメンド機能
- 企業アカウント
- チャット機能
- AIマッチング
- 応募分析

## プロジェクト構成

```
src/
├── app/
│   ├── page.tsx                 # 求職者: 動画フィード
│   ├── liked/                   # 保存リスト
│   ├── profile/                 # プロフィール
│   ├── admin/                   # 管理者画面
│   └── api/                     # REST API
├── components/
│   ├── VideoFeed.tsx            # 縦スクロールフィード
│   ├── VideoFeedItem.tsx        # 動画カード
│   ├── JobDetailModal.tsx       # 求人詳細
│   └── ApplyModal.tsx           # 応募フォーム
├── lib/
│   ├── supabase/                # Supabase クライアント
│   └── store.ts                 # インメモリストア
└── data/jobs.json               # サンプルデータ
database/
└── schema.sql                   # Supabase / PostgreSQL 設計
```
