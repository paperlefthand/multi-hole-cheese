# BadChat -- XSS セッションハイジャック ハンズオン

## 概要

BadChat は**意図的に脆弱性を埋め込んだ**リアルタイムチャットアプリケーションです。
攻撃者が Reflected XSS を利用してセッション Cookie を窃取し、被害者になりすます一連の流れを体験できます。

### 学習目標

- Reflected XSS の仕組みと危険性を理解する
- セッションハイジャック攻撃の流れを体験する
- 適切な対策方法（出力エスケープ、HttpOnly Cookie 等）を学ぶ

## アーキテクチャ

```
┌─ブラウザ──────────────────────────────┐
│ badchat.example.com      :80 (HTTP)  │
│ badchat.ws.example.com   :80 (WS)    │
│ badchat.trap.example.com :80 (HTTP)  │
└───────────────┬───────────────────────┘
                │
┌───────────────▼───────────────────────┐
│ nginx (リバースプロキシ)               │
├───────────────┬───────────────────────┤
│ PHP-FPM 8.3   │ WebSocket (Node.js)   │
│ チャット画面  │ メッセージ中継         │
│ ログイン処理  │                       │
├───────────────┘                       │
│ front-end ネットワーク                │
├───────────────────────────────────────┤
│ back-end ネットワーク                 │
├───────────────────────────────────────┤
│ MySQL 8.0     │ Adminer (:8080)       │
│ ユーザー管理  │ DB管理UI              │
└───────────────┴───────────────────────┘
```

ネットワーク構成図: [diagrams/badchat/network.puml](../diagrams/badchat/network.puml)

## 前提条件

- WSL2（Ubuntu 等）
- Docker Engine（WSL2 上にインストール。Docker Desktop は使いません）
- VS Code + 拡張機能 WSL / Dev Containers（Dev Container で作業する場合）
- テキストエディタ（Windows の hosts ファイル編集用）
- Web ブラウザ（Chrome 推奨、Windows 側で実行）

> **注意**: リポジトリは **WSL のファイルシステム内**（例: `~/garage/multi-hole-cheese`）に clone し、
> `docker compose` コマンドはすべて **WSL 上**で実行してください。
> ブラウザは **Windows 側**で開きます（WSL2 のポートは自動的に Windows へ転送されます）。

## セットアップ

### 1. hosts ファイルの編集

Windows の hosts ファイルに以下を追記してください。

**ファイルパス**: `C:\Windows\System32\drivers\etc\hosts`

```
127.0.0.1 badchat.example.com
127.0.0.1 badchat.ws.example.com
127.0.0.1 badchat.trap.example.com
```

> 編集にはメモ帳等を**管理者として実行**する必要があります。

### 2. 環境変数の設定（任意）

Cookie 窃取の通知先として Slack を使う場合（WSL 上で実行）:

```bash
cp .env.sample .env
# .env を編集して SLACK_CHANNEL_ID と SLACK_APP_TOKEN を設定
```

### 3. コンテナの起動

次のどちらかで起動します。

#### A. VS Code の Dev Container で起動する（推奨）

1. WSL 上でリポジトリを VS Code で開く: `code ~/garage/multi-hole-cheese`
2. 「ファイル > ファイルでワークスペースを開く」で `badchat.code-workspace` を開く
3. コマンドパレットから「Dev Containers: Reopen in Container」を実行し、`badchat` を選ぶ

`badchat/docker-compose.yml` の全サービスに加えて、作業用の `workspace` コンテナが WSL の Docker 上で起動し、VS Code はそのコンテナに接続します。
VS Code のウィンドウを閉じるとコンテナも停止します。

- ターミナルでは `curl http://badchat.example.com/` のように、ブラウザと同じホスト名でアクセスできます
- 「タスクの実行」から `badchat: logs` / `badchat: mysql` / `badchat: php lint` などを使えます
- SQLTools 拡張に DB 接続 `badchat db` が登録されています

#### B. WSL のターミナルで起動する

```bash
cd badchat
docker compose up -d
```

### 4. 動作確認

- チャットアプリ: http://badchat.example.com
- DB管理: http://localhost:8080

テスト用アカウント:

| ユーザー名 | パスワード |
| ---- | ---- |
| alice | password1 |
| bob | password2 |

---

## ハンズオン

### Step 1: 正常な操作を体験する

1. http://badchat.example.com にアクセス
2. `alice` / `password1` でログイン
3. チャットルームでメッセージを送信してみる
4. 別のブラウザ（またはシークレットウィンドウ）で `bob` でもログインし、会話できることを確認

> **ヒント**: `launch_chrome.ps1` を使うと、2つの Chrome プロファイルを同時起動できます。

### Step 2: XSS 脆弱性を確認する

ログイン済みの状態で、以下の URL に直接アクセスしてください:

```
http://badchat.example.com/index.php?name=<script>alert(document.cookie)</script>
```

**結果**: アラートダイアログにセッション Cookie（`PHPSESSID=...`）が表示されます。

#### なぜ動くのか?

`index.php` の 31 行目で GET パラメータをそのまま出力しています:

```php
// 脆弱なコード
echo $_GET['name'];
```

`<script>` タグがエスケープされずに HTML に埋め込まれるため、任意の JavaScript が実行されます。

### Step 3: 攻撃シナリオを体験する

攻撃の全体像は [diagrams/badchat/scenario.puml](../diagrams/badchat/scenario.puml) を参照してください。

1. `alice` でログインした状態を維持
2. 別タブで罠サイトにアクセス: http://badchat.trap.example.com
3. 罠サイトは偽の Amazon ページを表示し、裏で隠し iframe 経由で XSS を実行
4. `alice` の `PHPSESSID` が罠サイトのサーバーに送信される
5. （Slack 設定済みの場合）攻撃者の Slack に Cookie が通知される

#### 攻撃の流れ

```
被害者 → 罠サイト → 隠しiframe → BadChat (XSS発火) → Cookie窃取 → 攻撃者
```

### Step 4: 脆弱性一覧を確認する

| # | 脆弱性 | ファイル | 行 | 影響 |
|---|--------|---------|----|----|
| 1 | Reflected XSS | `html/badchat/index.php` | 31 | セッションハイジャック |
| 2 | 平文パスワード保存 | `db/initdb.d/02_insert_rows.sql` | - | パスワード漏洩 |
| 3 | 平文パスワード比較 | `html/badchat/login.php` | 43 | 上記と連動 |
| 4 | GET でユーザー名を渡す | `html/badchat/login.php` | 52 | XSS の起点 |
| 5 | CSRF トークン未検証 | `html/badchat/login.php` | 24 | CSRF 攻撃 |
| 6 | 出力未エスケープ | `html/badchat/login.php` | 79,88 | XSS |
| 7 | HttpOnly Cookie なし | `php-fpm/php.ini` | - | JS から Cookie 読取可能 |
| 8 | phpinfo() 公開 | `html/badchat/info.php` | - | サーバー情報漏洩 |
| 9 | WS メッセージ無制限 | `ws/server.js` | - | DoS |

---

## 修正版: goodchat

`goodchat/` ディレクトリに全脆弱性を修正したバージョンがあります。

### 起動方法

Dev Container の場合は `goodchat.code-workspace` を開き、「Dev Containers: Reopen in Container」で `goodchat` を選びます。
badchat と同時に起動できます（別ウィンドウで開いてください）。

ターミナルの場合は WSL 上で実行してください:

```bash
cd goodchat
docker compose up -d
```

ポート 81 で起動します: http://badchat.example.com:81

### 修正内容 Before / After

#### 1. Reflected XSS の修正 (`index.php`)

```php
// Before (badchat)
echo $_GET['name'];

// After (goodchat)
echo htmlspecialchars($_SESSION['name'], ENT_QUOTES, 'UTF-8');
```

GET パラメータではなくセッションから取得し、`htmlspecialchars()` でエスケープ。

#### 2. パスワードのハッシュ化 (`login.php`)

```php
// Before
if ($datas['password'] == $row['password'])

// After
if (password_verify($datas['password'], $row['password']))
```

DB には bcrypt ハッシュで保存。`password_verify()` で検証。

#### 3. GET パラメータの排除 (`login.php`)

```php
// Before
header("location:index.php?name=" . $_SESSION["name"]);

// After
header("location:index.php");
```

ユーザー名はセッションに保存済みなので URL に含める必要なし。

#### 4. CSRF トークン検証 (`login.php`)

```php
// After: POST 処理の先頭に追加
checkToken();
```

```html
<!-- After: フォームに hidden フィールドを追加 -->
<input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>">
```

#### 5. 出力エスケープ (`login.php`)

```php
// Before
echo '<div class="alert alert-danger">' . $login_err . '</div>';

// After
echo '<div class="alert alert-danger">' . htmlspecialchars($login_err, ENT_QUOTES, 'UTF-8') . '</div>';
```

#### 6. HttpOnly Cookie (`php.ini`)

```ini
; After: php.ini に追加
session.cookie_httponly = 1
session.cookie_samesite = "Strict"
```

JavaScript から `document.cookie` で読み取れなくなる。

#### 7. phpinfo() の削除

`info.php` を削除。サーバー構成情報を外部に公開しない。

#### 8. WebSocket メッセージ長制限 (`server.js`)

```javascript
// After: 1000文字を超えるメッセージを拒否
if (msgStr.length > MAX_MESSAGE_LENGTH) return;
```

---

## クリーンアップ

WSL 上で実行してください:

```bash
# badchat
cd badchat
docker compose down -v

# goodchat
cd ../goodchat
docker compose down -v
```

`-v` オプションでデータベースのボリュームも削除されます。
