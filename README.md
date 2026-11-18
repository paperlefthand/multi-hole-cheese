# ドキッ! 脆弱性だらけの Web アプリ

Web セキュリティの脆弱性を**体験しながら学ぶ**ハンズオン教材です。

意図的に脆弱性を埋め込んだアプリ（`badchat/`）と、修正済みのアプリ（`goodchat/`）を比較することで、攻撃と防御の両面を理解できます。

## プロジェクト一覧

| プロジェクト | 説明 | 学べる脆弱性 |
| ---- | ---- | ---- |
| [badchat](badchat/) | 脆弱なチャットアプリ + 罠サイト | XSS によるセッションハイジャック |
| [goodchat](goodchat/) | 修正済みチャットアプリ | 上記の対策方法 |

## はじめかた

[badchat/README.md](badchat/README.md) のハンズオン手順に従ってください。

## 開発環境

リポジトリは WSL 内に clone し、Docker も WSL 内の Docker Engine を使います（Docker Desktop は使いません）。

```bash
git clone git@github.com:paperlefthand/multi-hole-cheese.git ~/garage/multi-hole-cheese
code ~/garage/multi-hole-cheese
```

ハンズオンごとに VS Code のワークスペースと Dev Container を用意しています。

| ハンズオン | ワークスペース | Dev Container | 公開ポート |
| ---- | ---- | ---- | ---- |
| badchat | `badchat.code-workspace` | `.devcontainer/badchat/` | 80, 8080 |
| goodchat | `goodchat.code-workspace` | `.devcontainer/goodchat/` | 81, 8081 |

ワークスペースを開いて「Dev Containers: Reopen in Container」を実行し、同じ名前の構成を選んでください。
Dev Container は `.devcontainer/compose.devcontainer.yml` を各ハンズオンの `docker-compose.yml` に重ねて、作業用の `workspace` コンテナを追加します。

改行コードは `.gitattributes` で LF に統一しています（`*.ps1` のみ CRLF）。
