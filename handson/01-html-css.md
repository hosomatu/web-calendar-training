# ハンズオン 01: HTML/CSS - カレンダーのマークアップとスタイリング

## 概要

HTMLでカレンダーの構造を作り、CSSで見た目を整えます。
Webページの基本構造、テーブルの使い方、外部CSSの読み込み方を学びます。

## 前提知識

- テキストエディタの基本操作
- Docker環境が起動できること(`docker compose up` で `http://localhost:8080` にアクセスできる)

## 課題

Webブラウザで表示できる「今月のカレンダー」を作成してください。
`<table>` タグを利用してカレンダーを作成し、土日に色を付けてください。

**ヒント:**

まずはHTMLの基本構造から始めましょう。

```html
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Calendar</title>
</head>
<body>
  <!-- ここにカレンダーを作る -->
</body>
</html>
```

### ステップ1: HTMLの基本構造を理解する

- `<!DOCTYPE html>` → この文書がHTML5であることをブラウザに宣言する
- `<html lang="ja">` → 言語の宣言(日本語)
- `<meta charset="UTF-8">` → 文字エンコーディングの指定。これがないと日本語が文字化けする
- `lang="ja"` は言語の宣言であって文字コードの指定ではない点に注意

参考: [<meta>: メタデータ要素 - HTML | MDN](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/meta)

### ステップ2: テーブルの構造を理解する

```html
<table>
  <caption>2026年5月のカレンダー</caption>
  <thead>
    <tr>
      <th>SUN</th>
      <th>MON</th>
      <!-- ... -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>26</th>
      <th>27</th>
      <!-- ... -->
    </tr>
  </tbody>
</table>
```

- `<caption>` → テーブルのタイトル
- `<thead>` → ヘッダー行のグループ
- `<tbody>` → データ行のグループ
- `<tr>` → 行(table row)
- `<th>` → 見出しセル(table header)
- `<td>` → データセル(table data)

参考: [<table>: 表要素 - HTML | MDN](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/table)

### ステップ3: 動作確認

```sh
docker compose up
open http://localhost:8080
```

カレンダーが表示されることを確認してください。

---

### 課題2: CSSで土日に色を付ける

上記課題の「土日に色を付ける」部分です。
外部CSSファイルを作成して、土曜日と日曜日に色を付けてください。

### ステップ1: CSSファイルの読み込み

HTMLの `<head>` に以下を追加します。

```html
<link href="css/global.css" rel="stylesheet" />
```

- `<link>` → 外部リソースを読み込むタグ
- `rel="stylesheet"` → このファイルはCSSですよ、とブラウザに伝える属性
- `rel` は relationship(関係)の略

参考: [<link>: 外部リソースリンク要素 - HTML | MDN](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/link)

**注意:** `<style>` タグと `<link>` タグは別物です。
- `<link>` → 外部CSSファイルを読み込む(単独で使う)
- `<style>` → HTML内に直接CSSを書く

### ステップ2: classを使ってスタイルを当てる

HTMLの曜日ヘッダーにclassを付けます。

```html
<th scope="col" class="sun">SUN</th>
<th scope="col" class="sat">SAT</th>
```

CSSでそのclassに色を指定します。

```css
.sun {
  color: brown;
}

.sat {
  color: blue;
}
```

- `scope="col"` → アクセシビリティ用の属性。この見出しが「列方向」であることを示す
- `class` → CSSからスタイルを当てるための属性

列全体にスタイルを当てたい場合は `<colgroup>` も参考にしてください: [<colgroup> - HTML | MDN](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/colgroup)

### ステップ3: テーブルの罫線をCSSで指定する

HTMLの `border` 属性は非推奨です。CSSで指定しましょう。

```css
table {
  border: 2px solid rgb(140 140 140);
  border-collapse: collapse;
}

td, th {
  border: 1px solid rgb(140 140 140);
}
```

- `border-collapse: collapse` → セル間の隙間をなくす

---

## 学んだこと チェックリスト

- [ ] HTMLの基本構造(`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)
- [ ] `<meta charset="UTF-8">` の役割
- [ ] テーブル関連タグ(`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- [ ] 外部CSSの読み込み方(`<link>` タグ)
- [ ] `class` 属性とCSSセレクタの関係
- [ ] `border` はHTMLではなくCSSで指定する


