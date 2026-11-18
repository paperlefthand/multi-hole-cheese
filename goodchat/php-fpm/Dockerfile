FROM php:8.3-fpm

# mbstring のビルドに oniguruma が必要
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring \
    && rm -rf /var/lib/apt/lists/*
