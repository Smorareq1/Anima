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

# Crear directorio de logs si no existe
mkdir -p /var/www/html/storage/logs
chmod -R 777 /var/www/html/storage

# Limpiar cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Ejecutar comando principal
exec "$@"
