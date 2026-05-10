# Web Calendar Training

Webカレンダーを題材に、フロントエンド(HTML/CSS/JavaScript)からバックエンド(Node.js)までを一通り体験するハンズオン研修です。

## 目的

- HTML/CSS/JavaScriptの基礎を手を動かしながら学ぶ
- Dockerを使った開発環境の構築を体験する
- フロントエンドとバックエンドの役割の違いを理解する
- Webサーバー(nginx)とアプリケーションサーバー(Node.js)の関係を理解する

## 対象者

- Web開発の基礎を学びたい新人エンジニア
- フレームワークに頼る前に素のHTML/CSS/JSを理解したい人

## ハンズオン構成

| # | テーマ | 内容 | ファイル |
|---|--------|------|----------|
| 1 | HTML/CSS | カレンダーのマークアップとスタイリング | [handson/01-html-css.md](handson/01-html-css.md) |
| 2 | JavaScript | クリックイベントとlocalStorageによるデータ保存 | [handson/02-javascript.md](handson/02-javascript.md) |
| 3 | Backend | Node.jsによるHTMLの動的生成とnginxリバースプロキシ | [handson/03-backend.md](handson/03-backend.md) |

## 利用方法

- [fusic/web-calendar-training](https://github.com/fusic/web-calendar-training) をZIPダウンロードして、自分用のリポジトリにpushしてください
    - リポジトリ名は `fusic/web-calendar-training-名前` としてください
    - 例: `fusic/web-calendar-training-okazaki`
- 各ハンズオンの課題に取り組んで、出来上がったコードをPull Requestとして提出してください
- チューターをReviewerに指定して、ApproveされたらマージしてOKです

※ このリポジトリは課題に取り組んだ一例です。実装の参考にしてください。

## 起動方法

予めDockerおよびDocker Composeがインストールされていることを確認してください。

```sh
docker compose build
docker compose up

# 別ターミナルで
open http://localhost:8080
```

`content` 配下がドキュメントルートとして公開されています。
ファイルを変更した際は、ホットリロードはされないため `docker compose up` を `Ctrl+C` で中断後、再実行する必要があります。

## ディレクトリ構成

```
.
├── README.md
├── Dockerfile
├── docker-compose.yml
├── nginx/
│   ├── nginx.conf
│   └── default.conf
├── content/
│   ├── index.html
│   ├── css/
│   │   └── global.css
│   ├── javascript/
│   │   └── global.js
│   └── image/
├── backend/
│   └── server.js
└── handson/
    ├── 01-html-css.md
    ├── 02-javascript.md
    └── 03-backend.md
```
