# Windows 11 向け Docker 実行環境構築手順

Docker Desktop は企業での商用利用にライセンス確認が必要なため、本研修では **Rancher Desktop** を使用します。

## 全体像

Windows では Linux コンテナを直接実行できないため、WSL2 と Rancher Desktop を組み合わせます。

```text
Windows 11
├─ PowerShell / docker コマンド
├─ Rancher Desktop
└─ WSL2
    └─ Linux 環境
        └─ dockerd(moby)
            └─ コンテナ
```

## 事前条件

- Windows 11
- インターネット接続
- PowerShell が利用可能
- 必要に応じて管理者権限が利用可能

> 会社PCの場合、ソフトウェアのインストール制限・WSL2の利用制限・仮想化機能の無効化・社内プロキシ/VPN・セキュリティソフト等の影響で失敗する場合があります。

## 手順

### 1. WSL2 をインストールする

> **補足: WSL2 とは**
> WSL（Windows Subsystem for Linux）は、Windows の中で Linux を動かすための仕組みです。Docker のコンテナは Linux 上で動くため、Windows で Docker を使うには WSL2 が必要になります。WSL2 は WSL の改良版で、より高速かつ互換性が高くなっています。

Rancher Desktop は WSL2 を前提としています。Rancher Desktop のインストーラーが WSL2 のセットアップを促してくれる場合もありますが、事前にインストールしておくのが確実です。

PowerShell を **管理者として実行** し、以下を実行します。

> 管理者として実行する方法: タスクバーの検索で「PowerShell」と入力 → 表示された「Windows PowerShell」を右クリック → 「管理者として実行」を選択 → UACダイアログで「はい」をクリック

```powershell
wsl --install
```

再起動を求められた場合はPCを再起動してください。

### 2. Ubuntu を初回起動する

> **補足: Ubuntu と Linux の関係**
> Linux はOS の種類（Windows や macOS と並ぶもの）で、Ubuntu はその Linux の中の一つのバージョン（ディストリビューション）です。WSL2 ではデフォルトで Ubuntu がインストールされます。本研修で Ubuntu を直接操作することはありませんが、Docker がコンテナを動かすために裏側で利用しています。

再起動後、自動で Ubuntu の初期設定画面が開く場合があります。開かない場合は PowerShell で以下を実行します。

```powershell
wsl
```

初回起動時に Linux 用のユーザー名とパスワードの設定を求められます（Windows のログイン情報とは別です）。

### 3. WSL2 の状態を確認する

```powershell
wsl -l -v
```

`VERSION` が `2` になっていればOKです。`1` の場合は以下で変更します。

```powershell
wsl --set-version Ubuntu 2
wsl --set-default-version 2
```

### 4. Rancher Desktop をインストールする

Rancher Desktop は **Windows 側にインストール** するデスクトップアプリです（WSL 内で apt install するものではありません）。

```powershell
winget install SUSE.RancherDesktop
```

### 5. Rancher Desktop を起動・設定する

起動後、以下の設定を確認してください。

| 設定項目 | 推奨値 |
|----------|--------|
| Container Engine | dockerd(moby) |
| Kubernetes | disabled |

- **dockerd(moby)**: `docker` コマンドを使うために必要
- **Kubernetes disabled**: 本研修では不要。有効にするとリソース消費が増えるため無効推奨

### 6. 動作確認

PowerShell を **新しく開き直して** 以下を順に実行します。

```powershell
docker version
```

Client と Server の両方が表示されれば環境構築は完了です。

## トラブルシューティング

### `docker version` が失敗する（Client のみ表示される）

Docker daemon に接続できていません。以下を確認してください。

- Rancher Desktop が起動しているか
- Container Engine が `dockerd(moby)` になっているか
- Rancher Desktop の起動が完了しているか（Starting のままでないか）

### Rancher Desktop が Starting のまま進まない

WSL2 や仮想化機能に問題がある可能性があります。

```powershell
wsl -l -v
```

タスクマネージャー → パフォーマンス → CPU → 「仮想化: 有効」を確認してください。無効の場合は BIOS/UEFI で Intel VT-x / AMD-V を有効化する必要があります。

### `docker run hello-world` が失敗する

Docker Hub からイメージを取得できていません。社内プロキシ・VPN・セキュリティソフトによるネットワーク制限が原因の可能性があります。

### 既存の Docker Desktop と競合する

過去に Docker Desktop を使っていた場合、接続先が異なることがあります。

```powershell
where docker
docker context ls
docker context show
```

現在のコンテキストが Rancher Desktop のものになっているか確認してください。

## 参考記事

- [Docker Desktopの代わりにRancher Desktopを使ってみる（Qiita）](https://qiita.com/IoriGunji/items/f2a86ffdc629b6edc549)
- [Rancher DesktopでDocker Desktop代替環境を構築する（Zenn）](https://zenn.dev/mt_satak/articles/4d94ac6b75fb9a)
- [Rancher Desktopをインストールしてみた（DevelopersIO）](https://dev.classmethod.jp/articles/rancher-desktop-install-2209/)
