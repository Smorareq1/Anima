<?php

use App\Http\Controllers\App\home\HomeController;
use App\Http\Controllers\App\info\InfoController;
use App\Http\Controllers\App\register\RegisterController;
use App\Http\Controllers\App\login\LoginController;
use App\Http\Controllers\App\Spotify\SpotifyController;
use App\Services\Spotify\SpotifyService;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\App\Emotion\EmotionController;
use App\Http\Controllers\App\dashboard\DashboardController;
use App\Http\Controllers\App\dashboard\RecordController;
use App\Http\Controllers\App\dashboard\PlaylistController;
use App\Http\Controllers\App\Profile\ProfileController;
use App\Http\Controllers\App\dashboard\ExploreController;
use App\Http\Controllers\App\dashboard\FavoritesController;

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

    Route::prefix('emotion')->name('emotion.')->group(function () {
        Route::post('/upload', [EmotionController::class, 'upload'])->name('upload');
        Route::post('/playlists', [EmotionController::class, 'store'])->name('playlists.store');
        Route::get('/playlist/{id}', [EmotionController::class, 'show'])->name('playlists.show');
    });

    Route::get('/playlist/{id}', [PlaylistController::class, 'show'])->name('playlist.show');
});

Route::get('/spotify-test-public', function (SpotifyService $spotify) {
    try {
        $results = $spotify->testSpotifyAPI(null);
        return response()->json($results);
    } catch (\Exception $e) {
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
