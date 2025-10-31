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
    openssl-dev

# Instalar extensiones PHP
RUN docker-php-ext-install pdo pdo_pgsql pcntl

# Instalar Redis
RUN pecl install redis \
    && docker-php-ext-enable redis

# Configurar PHP
RUN echo "display_errors = On" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "display_startup_errors = On" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "error_reporting = E_ALL" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "log_errors = On" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "error_log = /var/log/php_errors.log" >> /usr/local/etc/php/conf.d/docker-php-errors.ini \
    && echo "post_max_size = 20M" >> /usr/local/etc/php/conf.d/docker-php-uploads.ini \
    && echo "upload_max_filesize = 20M" >> /usr/local/etc/php/conf.d/docker-php-uploads.ini \
    && echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/docker-php-memory.ini

# ⭐ CRÍTICO: Configurar PHP-FPM para TCP en 127.0.0.1:9000
RUN sed -i 's/listen = .*/listen = 127.0.0.1:9000/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/;catch_workers_output = .*/catch_workers_output = yes/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/;php_admin_flag\[log_errors\] = .*/php_admin_flag[log_errors] = on/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/;php_admin_value\[error_log\] = .*/php_admin_value[error_log] = \/var\/log\/php-fpm-error.log/' /usr/local/etc/php-fpm.d/www.conf

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

# Crear directorios de logs
RUN mkdir -p /var/log/php-fpm /var/www/html/storage/logs \
    && touch /var/log/php_errors.log \
    && touch /var/log/php-fpm-error.log \
    && chmod 666 /var/log/php_errors.log \
    && chmod 666 /var/log/php-fpm-error.log

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Copiar configuraciones
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
