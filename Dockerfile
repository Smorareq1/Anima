FROM php:8.4-fpm-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    postgresql-dev \
    zip \
    unzip \
    git \
    curl \
    nginx \
    supervisor \
    nodejs \
    npm \
    autoconf \
    g++ \
    make \
    openssl-dev \
    strace  # Para debugging

# Instalar extensiones PHP
RUN docker-php-ext-install pdo pdo_pgsql pcntl

# Instalar Redis
RUN pecl install redis \
    && docker-php-ext-enable redis

# IMPORTANTE: Configurar PHP para mostrar errores
RUN echo "display_errors = On" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "display_startup_errors = On" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "error_reporting = E_ALL" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "log_errors = On" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "error_log = /var/log/php_errors.log" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "post_max_size = 20M" >> /usr/local/etc/php/conf.d/docker-php-uploads.ini \
    && echo "upload_max_filesize = 20M" >> /usr/local/etc/php/conf.d/docker-php-uploads.ini \
    && echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/docker-php-memory.ini

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar archivos de composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copiar archivos de Node
COPY package*.json ./
RUN npm ci

# Copiar el resto de la aplicación
COPY . .

# Completar instalación de composer
RUN composer dump-autoload --optimize

# Compilar assets
RUN npm run build

# CREAR DIRECTORIOS DE LOGS
RUN mkdir -p /var/log/laravel /var/www/html/storage/logs \
    && touch /var/log/php_errors.log \
    && chmod 777 /var/log/php_errors.log \
    && chmod -R 777 /var/log/laravel

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Copiar configuraciones
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

# Script de entrada para debugging
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
