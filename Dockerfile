FROM php:8.4-fpm-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    postgresql-dev \
    zip \
    unzip \
    git \
    curl \
    nginx \
    supervisor

# Instalar extensiones PHP
RUN docker-php-ext-install pdo pdo_pgsql pcntl

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos de composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copiar el resto de la aplicación
COPY . .

# Completar instalación de composer
RUN composer dump-autoload --optimize

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Copiar configuraciones
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
