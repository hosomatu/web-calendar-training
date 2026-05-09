# 新人研修課題: Web Clendar

HTML, CSS, JavaScriptについて学習して、Webカレンダーを作成していきましょう。

## 利用方法

- このリポジトリをZIPダウンロードして、自分用のリポジトリにpushしてください。
    - リポジトリ名は `fusic/web-calendar-training-名前` としてください
    - 例: `fusic/web-calendar-training-okazaki`
- 課題に取り組んで出来上がったコードを、Pull Requestとして提出してください
- チューターをReviewerに指定して、ApproveされたらマージしてOKです

## 起動方法

予めDockerおよびDocker Composeがインストールされていることを確認してください。

```sh
docker compose build
docker compose up

# 別ターミナルで
open http://localhost:8080
```

`content` 配下がドキュメントルートとして公開されています。
ファイルを変更した際は、ホットリロードはされず `docker compose up` を `Ctrl+C` で中断後、再実行する必要があります。ご注意ください。
