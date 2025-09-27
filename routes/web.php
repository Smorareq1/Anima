<?php


use App\Http\Controllers\App\home\HomeController;
use App\Http\Controllers\App\register\RegisterController;
use App\Http\Controllers\App\login\LoginController;
use App\Http\Controllers\App\Spotify\SpotifyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\App\Emotion\EmotionController;
use App\Http\Controllers\App\dashboard\DashboardController;
use App\Http\Controllers\App\dashboard\RecordController;

Route::get('/', [HomeController::class, 'index'])->name('Home');
Route::get('/register', [RegisterController::class, 'index'])->name('Register');
Route::get('/login', [LoginController::class, 'index'])->name('Login');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('Dashboard');

Route::prefix('spotify')->name('spotify.')->group(function () {
    Route::get('/redirect', [SpotifyController::class, 'redirect'])->name('redirect');
    Route::get('/callback', [SpotifyController::class, 'callback'])->name('callback');
});

Route::get('/first-upload', [EmotionController::class, 'firstTime'])
    ->name('first.upload');

Route::get('/recommend', [EmotionController::class, 'recommend'])
    ->name('recommend');

// Endpoint compartido
Route::post('/emotion/upload', [EmotionController::class, 'upload'])
    ->name('emotion.upload');

Route::get('/records', [RecordController::class, 'index'])
    ->name('Record');
