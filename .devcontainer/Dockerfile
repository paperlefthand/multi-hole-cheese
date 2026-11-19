# ハンズオン共通の作業用コンテナ (全ハンズオンの Dev Container で共有)
FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# php-cli            : php -l による構文チェック
# default-mysql-client: db コンテナへの接続確認
# graphviz / jre     : PlantUML のローカルレンダリング
RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        php-cli \
        default-mysql-client \
        graphviz \
        default-jre-headless \
    && rm -rf /var/lib/apt/lists/*
