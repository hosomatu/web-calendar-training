# ハンズオン 03: Backend(環境構築) - Node.jsサーバーとnginxリバースプロキシ

## 概要

これまで静的HTMLとして作成していたカレンダーを、Node.jsのHTTPサーバーで配信するように変更します。
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
