FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . /var/www/html

#ptet pas obligatoire
# ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer install --no-scripts --no-interaction

EXPOSE 9000
