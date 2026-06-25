# oo-quest

oo-questは、社内ドキュメントや仕様書から作成したクイズJSONを読み込み、RPG風のバトルでプロジェクト知識を学習するWebアプリです。

## 起動

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## クエストJSON

実データは `public/quests/` に置き、`public/quests/index.json` に追記します。`index.sample.json` と `sample.json` が書式の見本です。

```json
[
  {
    "id": "project-a",
    "title": "Aプロジェクト仕様",
    "file": "/quests/project-a.json"
  }
]
```

## セキュリティ注意

本物の社内情報を含むJSONは絶対にGitへコミットしないでください。`.gitignore` で `public/quests/*` を除外し、サンプルだけを許可しています。

開発サーバー起動中は同一ネットワークからアクセスされる可能性があります。パブリックなWi-Fiでは実データを置いたまま公開状態にしないでください。

## 静的ビルド

```bash
npm run build
```

`next.config.ts` の `output: "export"` により、`out/` に静的ファイルが出力されます。
