# ドキッ! 脆弱性だらけの Web アプリ

## ネットワーク図

![network](diagrams/network/network.svg)

## hosts の編集

- mac: `/private/etc/hosts`
- windows: `C:\Windows\System32\drivers\etc\hosts`

```
127.0.0.1 badchat.example.com
127.0.0.1 badchat.ws.example.com
127.0.0.1 badchat.trap.example.com
```

## badchat

チャットアプリと罠サイト

- XSS
- `http://badchat.example.com?name=%3Cscript%3Ealert(document.cookie)%3C/script%3E`

<!-- ## bad-library

電子書籍の貸出管理

- SQLi

## bad-channel

オンライン掲示板

- XSS -->

## testing

- PlayWright  
  脆弱性診断
