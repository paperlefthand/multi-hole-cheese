# ドキッ! 脆弱性だらけの Web アプリ

Web セキュリティの脆弱性を**体験しながら学ぶ**ハンズオン教材です。

各アプリには、意図的に脆弱性を埋め込んだ版（`bad/`）と、修正済みの版（`good/`）があります。両者を比較することで、攻撃と防御の両面を理解できます。

## プロジェクト一覧

| アプリ | 版 | 説明 | 学べる脆弱性 |
| ---- | ---- | ---- | ---- |
| chat | [bad](chat/bad/) | 脆弱なチャットアプリ + 罠サイト | XSS によるセッションハイジャック |
| chat | [good](chat/good/) | 修正済みチャットアプリ | 上記の対策方法 |

## はじめかた

[chat/bad/README.md](chat/bad/README.md) のハンズオン手順に従ってください。

## ディレクトリ構成

```
<app>/
  bad/            脆弱な版 (docker-compose.yml, launch_chrome.ps1, README.md, ...)
  good/           修正版 (bad/ を丸ごとコピーして修正。diff -r bad good で差分を確認できる)
  diagrams/       構成図・シナリオ図 (PlantUML)
.devcontainer/
  <ver><app>/     ハンズオンごとの Dev Container (例: badchat, goodchat)
  compose.devcontainer.yml   全ハンズオン共通の Compose オーバーライド (作業用 workspace コンテナ)
  Dockerfile      作業用コンテナのイメージ
.vscode/          共通の設定・タスク・推奨拡張
```

## 開発環境

リポジトリは WSL 内に clone し、Docker も WSL 内の Docker Engine を使います（Docker Desktop は使いません）。

```bash
git clone git@github.com:paperlefthand/multi-hole-cheese.git ~/multi-hole-cheese
code ~/multi-hole-cheese
```

リポジトリのルートを VS Code で開き、「Dev Containers: Reopen in Container」で対象のハンズオンを選んでください。
Dev Container は `.devcontainer/compose.devcontainer.yml` を各ハンズオンの `docker-compose.yml` に重ねて、作業用の `workspace` コンテナを追加します。
コンテナ内では「タスクの実行」から `app: ps` / `app: logs` / `app: mysql` などが使えます（対象は Dev Container の環境変数 `APP_DIR` / `APP_DB` で決まります）。

### ポートとホスト名の規則

アプリ番号を k（chat = 1）とし、bad を 0、good を 1 とします。

| ハンズオン | プロジェクト名 (Compose / Dev Container) | Web (nginx) | Adminer | ホスト名 |
| ---- | ---- | ---- | ---- | ---- |
| chat/bad | `badchat` | 8100 | 8180 | `badchat.example.com`, `ws.badchat.example.com`, `trap.badchat.example.com` |
| chat/good | `goodchat` | 8101 | 8181 | `goodchat.example.com`, `ws.goodchat.example.com`, `trap.goodchat.example.com` |
| (一般形) | `<ver><app>` | 8k00 / 8k01 | 8k80 / 8k81 | `[<role>.]<ver><app>.example.com` |

- ホスト名は版ごとに分けます（Cookie はポートでは分離されないため）。
- ドメインは例示用に予約された `example.com` を使います。実在するドメインを使うと、名前解決の設定が効いていないときに、罠ページ経由で Cookie などが第三者のサーバーに送られてしまうためです。
- ブラウザは各ハンズオンの `launch_chrome.ps1` で起動します。`--host-resolver-rules="MAP *.example.com 127.0.0.1"` を指定しているので、Windows の hosts ファイルの編集は不要です。
- コンテナ内からは、各 `docker-compose.yml` で nginx に付けたネットワークエイリアスにより、同じホスト名（ポートなし = 80）でアクセスできます。

### 新しいハンズオンを追加するとき

1. `<app>/bad/` と `<app>/good/` を作る（リポジトリ直下から 2 階層目に置く。`compose.devcontainer.yml` の相対パスがこの深さを前提にしているため）
2. `docker-compose.yml` の `name`・`ports`・nginx の `aliases` を上の規則に合わせる
3. `.devcontainer/badchat/` をコピーして `.devcontainer/<ver><app>/` を作り、`name`・`dockerComposeFile`・`containerEnv` を書き換える

改行コードは `.gitattributes` で LF に統一しています（`*.ps1` のみ CRLF）。
