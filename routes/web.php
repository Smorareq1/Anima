<?php

use App\Http\Controllers\App\home\HomeController;
use App\Http\Controllers\App\register\RegisterController;
use App\Http\Controllers\App\login\LoginController;
use App\Http\Controllers\App\Spotify\SpotifyController;
use App\Services\Spotify\SpotifyService;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\App\Emotion\EmotionController;
use App\Http\Controllers\App\dashboard\DashboardController;
use App\Http\Controllers\App\dashboard\RecordController;
use App\Http\Controllers\App\dashboard\PlaylistController;

Route::get('/', [HomeController::class, 'index'])->name('Home');

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

    Route::prefix('emotion')->name('emotion.')->group(function () {
        Route::post('/upload', [EmotionController::class, 'upload'])->name('upload');
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

