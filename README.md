# Anima

Aplicación web para generar playlists personalizadas a partir de tus emociones, usando Inertia.js (React) en el frontend y Laravel 12 en el backend. Integra Spotify (OAuth y API) y Amazon Rekognition para análisis de imágenes.

## Tecnologías
- PHP 8.2, Laravel 12, Composer
- Inertia.js + React 19, Vite 7
- Tailwind CSS 4
- Redis/Predis (opcional)
- Spotify API (Socialite + SocialiteProviders/Spotify)
- Amazon Rekognition (aws/aws-sdk-php)
- Tests: PHPUnit, Jest (React Testing Library) y Playwright

## Requisitos
- PHP >= 8.2 y Composer
- Node.js >= 18 y npm
- PostgreSQL 
- Credenciales de Spotify (client_id, client_secret, redirect)
- Credenciales de AWS para Rekognition

## Instalación rápida
1. Clonar el repositorio e instalar dependencias:
   - Backend: `composer install`
   - Frontend: `npm install`
2. Copiar variables de entorno y generar key:
   - `cp .env.example .env`
   - `php artisan key:generate`
3. Configurar `.env` (ver sección Variables de Entorno) y base de datos.
4. Ejecutar migraciones (y enlace de storage si aplica):
   - `php artisan migrate`
   - `php artisan storage:link`
5. Iniciar entorno de desarrollo:
   - Backend y Vite por separado: `php artisan serve` y `npm run dev`
   - Ó bien, script combinado (con logs y cola): `composer run dev`

## Variables de Entorno
Ajusta en tu `.env` las siguientes claves (ejemplos):

- App/URL
```
APP_NAME=Anima
APP_ENV=local
APP_KEY=base64:... # se genera con key:generate
APP_DEBUG=true
APP_URL=http://127.0.0.1:8080
SESSION_DRIVER=file
SESSION_SECURE_COOKIE=false
```

- Base de datos (PostgrESQL recomendado)
```
DB_CONNECTION=pgsql
DB_HOST=...
```

- Spotify
```
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret
# Debe coincidir con la ruta de callback y estar configurada en el panel de Spotify
SPOTIFY_REDIRECT_URI=${APP_URL}/spotify/callback
# Scopes sugeridos (ver config/services.php si aplica)
SPOTIFY_SCOPES=user-read-email,user-read-private,playlist-modify-private,playlist-modify-public
```

- AWS Rekognition 
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
```

- Otros
```
CACHE_DRIVER=file
QUEUE_CONNECTION=sync # En dev; para colas reales usar database/redis
```

## Rutas principales
- GET `/` Home (Inertia)
- GET `/info` Info
- Auth (guest):
  - GET `/auth/register`, POST `/auth/register`
  - GET `/auth/login`, POST `/auth/login`
- Auth (auth):
  - POST `/auth/logout`
  - GET `/dashboard`
  - GET `/first-upload`
  - GET `/recommend`
  - GET `/records`
  - GET `/explore`
  - GET `/favorites`, POST `/favorites` (toggle)
  - GET `/stats` y sub-rutas de estadísticas
  - GET `/administrator`
  - POST `/profile`
  - Grupo `emotion/`:
    - POST `/emotion/upload`
    - POST `/emotion/playlists`
    - GET `/emotion/playlist/temp`
    - GET `/emotion/playlist/{id}`
  - GET `/playlist/{id}` (detalles)
- Spotify:
  - GET `/spotify/redirect`
  - GET `/spotify/callback`
- Utilidad/Debug:
  - GET `/spotify-test-public`
  - GET `/test-basic`
  - GET `/test-aws`

## Flujo de autenticación
- Frontend con Inertia y middleware `HandleInertiaRequests` comparte `auth.user`, `hasSpotify` y `flash`.
- Login/Register bajo prefijo `/auth` y middleware `guest`.
- Logout bajo `/auth/logout` con middleware `auth`.

## Scripts útiles
- Backend:
  - `composer run dev` → inicia servidor Laravel, cola, logs y Vite (requiere Node)
  - `composer test` → limpia config y ejecuta PHPUnit
- Frontend:
  - `npm run dev` → Vite en modo desarrollo
  - `npm run build` → build de producción
  - `npm test` → Jest + React Testing Library

## Tests
- PHP: `php artisan test`
- JS (Jest): `npm test`
- E2E (Playwright): revisar `playwright.config.ts` y ejecutar `npx playwright test` (si aplica)

## Estructura relevante
- Backend:
  - `app/Http/Controllers/App/...` controladores para dashboard, auth, emoción, spotify, etc.
  - `app/Http/Middleware/HandleInertiaRequests.php` comparte props a Inertia
  - `app/Exceptions/Handler.php` (personalizado en `app/Http/Controllers/App/Exceptions/Handler.php` en este repo) renderiza página de error Inertia
  - `app/Services/...` integración con Spotify, Rekognition, Playlists y generación de collages
  - `routes/web.php` define la mayoría de rutas
- Frontend:
  - `resources/js/app.jsx` configuración de Inertia + Vite, carga páginas `./Pages/**/*.jsx`
  - `resources/js/Pages` páginas React (dashboard, Error.jsx, etc.)
  - `resources/js/Components` componentes reutilizables (HttpError.jsx, LoginForm.jsx, etc.)

## Despliegue rápido (resumen)
1. Configura `.env` con URL pública, base de datos y credenciales de Spotify/AWS.
2. Ejecuta `php artisan migrate --force` y `npm run build`.
3. Sirve `public/` detrás de Nginx/Apache y configura HTTPS para callbacks de Spotify si corresponde.

## Solución de problemas
- 419 (Sesión expirada) con Inertia:
  - Verifica cookies, dominio y `SESSION_DRIVER`; limpia cachés (`php artisan config:clear`)
- Error de callback de Spotify (redirect_uri_mismatch):
  - Asegúrate de que `SPOTIFY_REDIRECT_URI` coincida exactamente con la configurada en Spotify
- AWS Rekognition AccessDenied:
  - Revisa IAM policies y región; confirma `AWS_DEFAULT_REGION`
- Vite no recarga o falla build:
  - Borra `node_modules` y reinstala; valida versión de Node compatible
