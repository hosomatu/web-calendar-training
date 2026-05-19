# macOS 向け Docker 実行環境構築手順

Docker Desktop は企業での商用利用にライセンス確認が必要なため、本研修では **Rancher Desktop** を使用します。

## 全体像

```text
macOS
├─ ターミナル / docker コマンド
├─ Rancher Desktop
└─ Lima (軽量 Linux VM)
    └─ dockerd(moby)
        └─ コンテナ
```

## 事前条件

- macOS（Intel / Apple Silicon どちらでも可）
- インターネット接続
- Homebrew がインストール済み（推奨）

## 手順

### 1. Rancher Desktop をインストールする

Homebrew を使う場合:

```sh
brew install --cask rancher
```

Homebrew を使わない場合は [Rancher Desktop 公式サイト](https://rancherdesktop.io/) からダウンロードしてインストールしてください。

### 2. Rancher Desktop を起動・設定する

起動後、以下の設定を確認してください。

| 設定項目 | 推奨値 |
|----------|--------|
| Container Engine | dockerd(moby) |
| Kubernetes | disabled |

### 3. 動作確認

ターミナルを **新しく開き直して** 以下を順に実行します。

```sh
docker version
```

Client と Server の両方が表示されれば環境構築は完了です。

## トラブルシューティング

### `docker` コマンドが見つからない

Rancher Desktop の設定で PATH にシンボリックリンクを作成するオプションを有効にしてください。または、ターミナルを開き直してください。

### `docker version` で Server が表示されない

Rancher Desktop が起動完了しているか、Container Engine が `dockerd(moby)` になっているかを確認してください。
