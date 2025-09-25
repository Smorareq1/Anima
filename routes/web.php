<?php


use App\Http\Controllers\App\home\HomeController;
use App\Http\Controllers\App\register\RegisterController;
use App\Http\Controllers\App\login\LoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\App\Emotion\EmotionController;
use App\Http\Controllers\App\dashboard\DashboardController;

Route::get('/', [HomeController::class, 'index'])->name('Home');
Route::get('/register', [RegisterController::class, 'index'])->name('Register');
Route::get('/login', [LoginController::class, 'index'])->name('Login');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('Dashboard');

Route::get('/first-upload', [EmotionController::class, 'firstTime'])
    ->name('first.upload');

Route::get('/recommend', [EmotionController::class, 'recommend'])
    ->name('recommend');

// Endpoint compartido
Route::post('/emotion/upload', [EmotionController::class, 'upload'])
    ->name('emotion.upload');
