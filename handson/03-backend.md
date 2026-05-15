# ハンズオン 03: Backend - Node.jsによるHTML動的生成

## 概要

これまで静的HTMLとして作成していたカレンダーを、Node.jsのHTTPサーバーで動的に生成するように変更します。
Webサーバー(nginx)とアプリケーションサーバー(Node.js)の役割分担、リバースプロキシの仕組みを学びます。

## 前提知識

- ハンズオン01, 02が完了していること
- Docker環境が動作すること

## 背景: なぜバックエンドが必要か？

現在のカレンダーは「2026年5月」がHTMLにハードコードされています。
毎月HTMLを書き換えるのは現実的ではないので、サーバー側で「今月」のカレンダーを自動生成するようにします。

---

## Webサーバーとアプリケーションサーバーの関係

今回の構成:

```
ブラウザ → nginx(Webサーバー) → Node.js(アプリケーションサーバー)
```

**nginx(Webサーバー)の役割:**
- HTTPリクエストの受付
- 静的ファイル(CSS, JS)の配信
- リクエストをNode.jsに転送(リバースプロキシ)

**Node.js(アプリケーションサーバー)の役割:**
- HTMLの動的生成(今月のカレンダーを計算して組み立てる)
- ビジネスロジックの実行

**なぜ分けるのか？**

nginxは「ファイルを返す」「リクエストを転送する」ことに特化した軽量プログラムです。
プログラミング言語を実行する機能を持たない代わりに、1スレッドで数千接続を管理できます。

Node.jsはリクエストごとにJavaScriptのコードを実行するため、1リクエストあたりの処理が重くなります。
CSSや画像を返すだけの処理にNode.jsを使うのは無駄なので、nginxに任せます。

---

## 課題

### 課題1: Node.jsでHTTPサーバーを作成する

まずは既存の `content/index.html` をそのまま読み取って返すだけのサーバーを作ります。

### ステップ1: backend/server.js を作成する

```javascript
const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {
  const htmlPath = '/content/index.html';
  const html = fs.readFileSync(htmlPath, 'utf-8');

  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(html);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

- `http.createServer` → HTTPサーバーを作成する。引数のコールバック関数がリクエストごとに実行される
- `fs.readFileSync` → ファイルを同期的に読み込む
- `/content/index.html` → コンテナ内のパス(docker-compose.ymlでマウントしている)
- `response.writeHead(200, ...)` → ステータスコード200(成功)とヘッダーを返す
- `response.end(html)` → レスポンスボディを返して接続を終了する
- `server.listen(3000)` → ポート3000でリクエストを待ち受ける

**補足: `require` と `import` について**

`const http = require('http')` はNode.jsの組み込みモジュールを読み込む構文(CommonJS方式)です。`http` や `fs` はNode.jsに最初から含まれているので `npm install` は不要です。

現在のJavaScript/TypeScriptでは `import http from 'http'` (ES Modules方式)が主流になりつつありますが、ES Modulesを使うには `package.json` に `"type": "module"` の設定が必要です。今回は `package.json` なしで1ファイルだけで動かせるシンプルさを優先して `require` を使っています。

参考: [HTTP | Node.js Documentation](https://nodejs.org/api/http.html) / [File system | Node.js Documentation](https://nodejs.org/api/fs.html)

### ステップ2: docker-compose.yml にappサービスを追加する

```yaml
services:
  web:
    build: ./
    ports:
      - "8080:80"
    volumes:
      - ./content:/usr/share/nginx/html
  app:
    image: node:22
    working_dir: /backend
    volumes:
      - ./backend:/backend
      - ./content:/content
    command: node server.js
```

- `app` → サービス名。docker-compose内の他コンテナから `app` というホスト名で名前解決できる
- `working_dir: /backend` → コンテナ内の作業ディレクトリ
- `./backend:/backend` → ホストの `backend` ディレクトリをコンテナ内の `/backend` にマウント
- `./content:/content` → ホストの `content` ディレクトリをコンテナ内の `/content` にマウント(server.jsから読み取るため)
- `expose` は省略可能(docker-compose内のコンテナ同士は同じネットワークにいるので通信できる)

### ステップ3: nginx/default.conf をリバースプロキシに変更する

```nginx
server {
  listen 80;

  location / {
    proxy_pass http://app:3000;
  }

  location /css/ {
    root /usr/share/nginx/html;
  }

  location /javascript/ {
    root /usr/share/nginx/html;
  }
}
```

- `proxy_pass http://app:3000` → 全てのリクエストをNode.js(app:3000)に転送する
- `location /css/` → CSSへのリクエストはnginxが直接静的ファイルを返す
- `location /javascript/` → JSへのリクエストも同様
- nginxは具体的なパスを優先するので、`/css/` や `/javascript/` は `/` より先にマッチする

参考: [nginx proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)

**`app` で名前解決できる理由:**

docker-composeは同じネットワーク内のコンテナに対して、サービス名をホスト名として自動登録するDNSを提供しています。
これはnginxの機能ではなくDockerネットワークの機能です。

### ステップ4: 動作確認

```sh
docker compose up --build
open http://localhost:8080
```

既存のカレンダーがそのまま表示されれば成功です。

### ステップ5: カレンダーのタイトルを動的に生成する

HTMLの `<caption>` 内をプレースホルダーに変更します。

**content/index.html:**
```html
<caption>
  {{CALENDAR_TITLE}}
</caption>
```

**backend/server.js:**
```javascript
const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const htmlPath = '/content/index.html';
  let html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace('{{CALENDAR_TITLE}}', `${currentYear}年${currentMonth}月のカレンダー`);

  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(html);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

- `new Date()` → 現在日時を取得
- `getFullYear()` → 年を取得(例: 2026)
- `getMonth() + 1` → 月を取得(0始まりなので+1が必要)
- `html.replace('{{CALENDAR_TITLE}}', ...)` → HTMLのプレースホルダーを動的な値に置換

**補足: `Date` は `require` なしで使えるのはなぜ？**

`Date` はJavaScript言語自体に組み込まれたグローバルなクラスです。`http` や `fs` はNode.js固有のモジュールなので `require` が必要ですが、`Date`, `Math`, `Array`, `JSON` などはどの環境(ブラウザでもNode.jsでも)でも最初から使えます。

なお、同じグローバルでも `Date` と `Math` は性質が異なります。`Date` はクラスなので `new Date()` でインスタンスを作り、そのインスタンスが「特定の日時」という状態を保持します。一方 `Math` はクラスではなく `{PI: 3.14, floor: function(){...}}` のようなただのオブジェクトで、状態を持たず `Math.floor(3.7)` のように直接メソッドを呼びます。

なお、Node.js 26以降では `Date` の後継として `Temporal` APIが標準で使えるようになっています。`Date` は月が0始まりだったり設計上の問題が多いため、今後は `Temporal` への移行が進む見込みです。今回はNode.js 22を使用しているため `Date` を使っています。

**ゴール:** ブラウザに表示されるカレンダーのタイトルが、ハードコードではなくサーバー側で現在の年月から動的に生成されていること。月が変わればタイトルも自動的に変わります。

---

### 課題2: カレンダーの日付部分をforループで動的に生成する

HTMLにハードコードしていた日付のセル(`<td>`)を、Node.js側でforループを使って生成するようにします。

**要件:**
- 当月の日数を計算してテーブルを組み立てること
- 月の開始曜日を計算して正しい位置に日付を配置すること
- HTMLの `<tbody>` 部分をforループで生成すること

### ステップ1: 月の日数と開始曜日を計算する

```javascript
// 2026年5月の場合
const year = 2026;
const month = 5;

// 月の日数を取得(翌月の0日目 = 当月の最終日)
const daysInMonth = new Date(year, month, 0).getDate(); // (year, month, day)で、0 を指定すると「その月の0日目」= 「前月の最終日」になる定番の方法

// 月の最初の日の曜日を取得(0=日曜, 1=月曜, ..., 6=土曜)
const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 4(木曜)
```

- `new Date(year, month, 0)` → 「6月の0日目」=「5月の最終日」というトリック
参考:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
- `.getDate()` → 日付を取得(この場合は最終日 = 日数)
- `.getDay()` → 曜日を数値で取得。わかりにくい。。。Dateオブジェクトの設計上の問題の一つらしい。


### ステップ2: forループでHTMLを組み立てる

```javascript
let calendarBody = '';
let dayCount = 1;

// 週ごとにループ
for (let week = 0; dayCount <= daysInMonth; week++) {
  calendarBody += '<tr>';

  // 曜日ごとにループ(0=日曜〜6=土曜)
  for (let dow = 0; dow < 7; dow++) {
    if ((week === 0 && dow < firstDayOfWeek) || dayCount > daysInMonth) {
      calendarBody += '<td></td>'; // 空セル
    } else {
      calendarBody += `<td>${dayCount}</td>`;
      dayCount++;
    }
  }

  calendarBody += '</tr>';
}
```

### ステップ3: プレースホルダーで差し込む

HTMLの `<tbody>` 内を `{{CALENDAR_BODY}}` に変更し、server.jsで置換します。

**content/index.html:**
```html
<tbody>
  {{CALENDAR_BODY}}
</tbody>
```

**backend/server.js:**
```javascript
html = html.replace('{{CALENDAR_BODY}}', calendarBody);
```

**ゴール:** HTMLに日付をハードコードせず、サーバー側で当月のカレンダーが自動生成されること。

---

### 課題3: クエリパラメータで月を移動できるようにする

URLにクエリパラメータ(`?year=2026&month=3`)を付けることで、任意の月のカレンダーを表示できるようにします。

**要件:**
- 初回アクセス(`/`)は当月のカレンダーを表示する
- `/?year=2026&month=3` で2026年3月のカレンダーを表示する
- 「前の月」「次の月」リンクを設置してクリックで月移動できる
- 「今月」リンクを設置してクリックで当月に戻れる

### ステップ1: クエリパラメータを取得する

```javascript
const url = require('url');

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const query = parsedUrl.query;

  const now = new Date();
  const year = query.year ? parseInt(query.year) : now.getFullYear();
  const month = query.month ? parseInt(query.month) : now.getMonth() + 1;
  // ...
});
```

- `url.parse(request.url, true)` → URLを解析してクエリパラメータをオブジェクトとして取得
- `query.year` → `?year=2026` の `2026` を取得(文字列なので `parseInt` で数値に変換)
- パラメータがなければ現在の年月を使う

参考: [URL | Node.js Documentation](https://nodejs.org/api/url.html)

### ステップ2: 前月・次月・今月リンクを生成する

```javascript
const prevMonth = month === 1 ? 12 : month - 1;
const prevYear = month === 1 ? year - 1 : year;
const nextMonth = month === 12 ? 1 : month + 1;
const nextYear = month === 12 ? year + 1 : year;

const navigation = `
  <a href="/?year=${prevYear}&month=${prevMonth}">← 前の月</a>
  <a href="/">今月</a>
  <a href="/?year=${nextYear}&month=${nextMonth}">次の月 →</a>
`;
```

HTMLにナビゲーション用のプレースホルダー(`{{CALENDAR_NAV}}`)を追加して置換します。

### ステップ3: 動作確認

```sh
docker compose up --build
open http://localhost:8080
open http://localhost:8080/?year=2026&month=3
```

- `/` → 今月のカレンダーが表示される
- `/?year=2026&month=3` → 2026年3月のカレンダーが表示される
- 「前の月」「次の月」リンクで月移動できる
- 「今月」リンクで当月に戻れる

**ゴール:** URLのクエリパラメータに応じて任意の月のカレンダーが表示でき、リンクで月を移動できること。

---

## 1ページ表示時のHTTPリクエストの流れ

ブラウザで `http://localhost:8080` にアクセスすると、以下のリクエストが発生します:

1. `GET /` → nginx → Node.js → HTMLを返す
2. ブラウザがHTMLを解析
3. `GET /css/global.css` → nginx → 静的ファイルを返す
4. `GET /javascript/global.js` → nginx → 静的ファイルを返す

DevToolsの「Network」タブで実際にこの流れを確認してみてください。

---

## 学んだこと チェックリスト

- [ ] Node.jsの `http` モジュールでHTTPサーバーを作る方法
- [ ] `fs` モジュールでファイルを読み込む方法
- [ ] docker-composeで複数コンテナを連携させる方法
- [ ] nginxのリバースプロキシ設定(`proxy_pass`)
- [ ] docker-compose内のサービス名による名前解決
- [ ] Webサーバーとアプリケーションサーバーの役割分担
- [ ] `Date` を使った日付計算(日数、曜日)
- [ ] forループによるHTML動的生成
- [ ] クエリパラメータの取得と利用(`url.parse`)
- [ ] ナビゲーションリンクの動的生成


