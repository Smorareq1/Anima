<?php

use App\Http\Controllers\App\home\HomeController;
use App\Http\Controllers\App\info\InfoController;
use App\Http\Controllers\App\register\RegisterController;
use App\Http\Controllers\App\login\LoginController;
use App\Http\Controllers\App\Spotify\SpotifyController;
use App\Services\amazon\RekognitionService;
use App\Services\Spotify\SpotifyService;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\App\Emotion\EmotionController;
use App\Http\Controllers\App\dashboard\DashboardController;
use App\Http\Controllers\App\dashboard\RecordController;
use App\Http\Controllers\App\dashboard\PlaylistController;
use App\Http\Controllers\App\Profile\ProfileController;
use App\Http\Controllers\App\dashboard\ExploreController;
use App\Http\Controllers\App\dashboard\FavoritesController;
use App\Http\Controllers\App\dashboard\AdminController;
use App\Http\Controllers\App\dashboard\StatsController;
use Inertia\Inertia;
use Illuminate\Http\Request;


Route::get('/', [HomeController::class, 'index'])->name('Home');
Route::get('/info', [InfoController::class, 'index'])->name('Info');

Route::prefix('spotify')->name('spotify.')->group(function () {
    Route::get('/redirect', [SpotifyController::class, 'redirect'])->name('redirect');
    Route::get('/callback', [SpotifyController::class, 'callback'])->name('callback');
});

Route::prefix('auth')->name('auth.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/register', [RegisterController::class, 'index'])->name('register.show');
        Route::post('/register', [RegisterController::class, 'store'])->name('register.store');

        Route::get('/login', [LoginController::class, 'index'])->name('login.show');
        Route::post('/login', [LoginController::class, 'store'])->name('login.store');
    });
    Route::middleware('auth')->group(function () {
        Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
    });
});

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('Dashboard');

    Route::get('/first-upload', [EmotionController::class, 'firstTime'])->name('first.upload');
    Route::get('/recommend', [EmotionController::class, 'recommend'])->name('recommend');
    Route::get('/records', [RecordController::class, 'index'])->name('Record');
    Route::get('/explore', [ExploreController::class, 'index'])->name('explore');
    Route::get('/favorites', [FavoritesController::class, 'index'])->name('favorites');
    Route::post('/favorites', [FavoritesController::class, 'toggleFavorite'])->name('favorites.toggle');
    Route::get('/stats', [StatsController::class, 'index'])->name('stats');
    Route::get('/administrator', [AdminController::class, 'index'])->name('administrator');

    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::prefix('emotion')->name('emotion.')->group(function () {
        Route::post('/upload', [EmotionController::class, 'upload'])->name('upload');
        Route::post('/playlists', [EmotionController::class, 'store'])->name('playlists.store');
        Route::get('/playlist/temp', function (Request $request) {
            return Inertia::render('PlaylistShow', [
                'playlistData' => $request->session()->get('playlistData'),
                'emotion' => optional($request->session()->get('playlistData'))['emotion'] ?? null,
            ]);
        })->name('playlists.temp');
        Route::get('/playlist/{id}', [EmotionController::class, 'show'])->name('playlists.show');
    });

    Route::get('/playlist/{id}', [PlaylistController::class, 'show'])->name('playlist.show');
});

Route::get('/spotify-test-public', function (SpotifyService $spotify) {
    try {
        $results = $spotify->testSpotifyAPI(null);
        return response()->json($results);
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

Route::get('/test-basic', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Routes are working',
        'timestamp' => now()->toISOString()
    ]);
});

// --- API Routes for Frontend (using Session Auth) ---
Route::prefix('api')->middleware('auth')->group(function () {
    Route::post('/profile', [ProfileController::class, 'update'])->name('api.profile.update');
});

// TEST AWS
Route::get('/test-aws', function () {
    try {
        $service = app(RekognitionService::class);

        return response()->json([
            'status' => 'ok',
            'aws_available' => method_exists($service, 'isAvailable') ? $service->isAvailable() : 'method not exists',
            'config' => [
                'key' => config('aws.credentials.key') ? 'SET (' . substr(config('aws.credentials.key'), 0, 10) . '...)' : 'NOT SET',
                'secret' => config('aws.credentials.secret') ? 'SET' : 'NOT SET',
                'region' => config('aws.region'),
            ]
        ]);
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
});

Route::post('/test-upload-direct', function (Request $request) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);

    try {
        $request->validate([
            'photo' => 'required|image'
        ]);

        $path = $request->file('photo')->store('emotions', 'local');
        $fullPath = Storage::disk('local')->path($path);

        $rekognition = app(RekognitionService::class);
        $emotions = $rekognition->detectEmotion($fullPath, 3);

        Storage::disk('local')->delete($path);

        return response()->json([
            'success' => true,
            'emotions' => $emotions
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString())
        ], 500);
    }
});

Route::get('/test-minimal', function() {
    try {
        $rekognition = app(RekognitionService::class);
        return response()->json([
            'status' => 'OK',
            'message' => 'Rekognition loaded successfully',
            'available' => $rekognition->isAvailable()
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'ERROR',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

// routes/web.php
Route::get('/container-debug', function () {
    return response()->json([
        'php_version' => PHP_VERSION,
        'laravel_version' => app()->version(),
        'environment' => app()->environment(),
        'debug_mode' => config('app.debug'),
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size'),
        'aws_configured' => !empty(env('AWS_ACCESS_KEY_ID')),
        'storage_writable' => is_writable(storage_path()),
        'logs_writable' => is_writable(storage_path('logs')),
        'error_log' => ini_get('error_log'),
        'display_errors' => ini_get('display_errors'),
        'last_error' => error_get_last(),
    ]);
});

Route::post('/test-upload-container', function (Request $request) {
    // Forzar output de errores
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $steps = [];

    try {
        $steps[] = '1. Starting upload test';

        // Verificar archivo
        if (!$request->hasFile('photo')) {
            return response()->json([
                'error' => 'No file uploaded',
                'steps' => $steps,
                'request_content_type' => $request->header('Content-Type'),
                'request_method' => $request->method(),
            ]);
        }

        $steps[] = '2. File received';

        // Guardar archivo
        $path = $request->file('photo')->store('emotions', 'local');
        $steps[] = '3. File stored: ' . $path;

        $fullPath = storage_path('app/' . $path);
        $steps[] = '4. Full path: ' . $fullPath;
        $steps[] = '5. File exists: ' . (file_exists($fullPath) ? 'yes' : 'no');
        $steps[] = '6. File size: ' . filesize($fullPath);

        // Intentar cargar Rekognition
        $steps[] = '7. Loading RekognitionService...';

        // Usar el namespace correcto
        $rekognition = app(\App\Services\amazon\RekognitionService::class);

        $steps[] = '8. RekognitionService loaded';
        $steps[] = '9. Service available: ' . ($rekognition->isAvailable() ? 'yes' : 'no');

        if (!$rekognition->isAvailable()) {
            Storage::disk('local')->delete($path);
            return response()->json([
                'error' => 'Rekognition not available',
                'steps' => $steps,
                'aws_key_set' => !empty(env('AWS_ACCESS_KEY_ID')),
                'aws_secret_set' => !empty(env('AWS_SECRET_ACCESS_KEY')),
            ]);
        }

        // Detectar emociones
        $steps[] = '10. Calling detectEmotion...';
        $emotions = $rekognition->detectEmotion($fullPath, 3);
        $steps[] = '11. Emotions detected: ' . json_encode($emotions);

        // Limpiar
        Storage::disk('local')->delete($path);
        $steps[] = '12. Cleanup complete';

        return response()->json([
            'success' => true,
            'emotions' => $emotions,
            'steps' => $steps
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'steps' => $steps,
            'trace' => array_slice($e->getTrace(), 0, 5)
        ], 500);
    }
});
