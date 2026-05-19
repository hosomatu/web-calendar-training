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
| 3 | Backend(環境構築) | Node.jsサーバーとnginxリバースプロキシ | [handson/03-backend.md](handson/03-backend.md) |
| 4 | Backend(動的生成) | カレンダーの動的生成とクエリパラメータによる月移動 | [handson/04-dynamic-calendar.md](handson/04-dynamic-calendar.md) |

## 利用方法

- [hosomatu/web-calendar-training](https://github.com/hosomatu/web-calendar-training) をZIPダウンロードして、自分用のリポジトリにpushしてください
    - リポジトリ名は `web-calendar-training-名前` としてください
    - 例: `web-calendar-training-mori`
- 各ハンズオンの課題に取り組んで、出来上がったコードをPull Requestとして提出してください
- チューターをReviewerに指定して、ApproveされたらマージしてOKです

※ このリポジトリは課題に取り組んだ一例です。実装の参考にしてください。

## 環境構築

本研修では Docker を使用します。Docker Desktop はライセンスの関係上、**Rancher Desktop** を推奨しています。

- [Windows 11 向け環境構築手順](docs/setup-windows.md)
- [macOS 向け環境構築手順](docs/setup-mac.md)

以下のコマンドが成功することを確認してから研修を開始してください。

```sh
docker version
```

## 起動方法

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
├── docs/
│   ├── setup-windows.md
│   └── setup-mac.md
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
├── handson/
│   ├── 01-html-css.md
│   ├── 02-javascript.md
│   ├── 03-backend.md
│   └── 04-dynamic-calendar.md
└── examples/
    ├── handson1-completed/
    ├── handson2-completed/
    ├── handson3-completed/
    └── handson4-completed/
```

`examples/` 配下には各ハンズオン完了時点のコード一式が入っています。詰まったときの参考にしてください。
