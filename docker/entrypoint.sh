#!/bin/sh
set -e

echo "Starting Laravel Container App..."

# Verificar variables de entorno críticas
echo "Checking environment variables..."
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "WARNING: AWS_ACCESS_KEY_ID not set"
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "WARNING: AWS_SECRET_ACCESS_KEY not set"
fi

# Verificar que PHP-FPM esté configurado correctamente
echo "Checking PHP-FPM configuration..."
grep "listen = " /usr/local/etc/php-fpm.d/www.conf || echo "ERROR: Could not find listen directive"

# Crear TODOS los directorios de logs necesarios
mkdir -p /var/www/html/storage/logs \
         /var/log/php-fpm \
         /var/log/supervisor \
         /var/log/nginx

chmod -R 777 /var/www/html/storage
touch /var/log/php-fpm-error.log
chmod 666 /var/log/php-fpm-error.log

# Limpiar cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo "Entrypoint completed. Starting supervisord..."

# Ejecutar comando principal
exec "$@"
