# oo-quest

oo-questは、クイズJSONを置いて勉強できるRPG風のWebアプリです。

## 起動

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## クエストJSON

クイズJSONは `public/quests/` に置き、`public/quests/index.json` に追記します。`index.sample.json` と `sample.json` が書式の見本です。

```json
[
  {
    "id": "project-a",
    "title": "Aプロジェクト仕様",
    "file": "/quests/project-a.json"
  }
]
```

`public/quests/*` は `.gitignore` で除外しています。サンプルJSONだけをリポジトリに含める設定です。

## 静的ビルド

```bash
npm run build
```

`next.config.ts` の `output: "export"` により、`out/` に静的ファイルが出力されます。
