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
