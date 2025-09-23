<?php


use App\Http\Controllers\App\home\HomeController;
use App\Http\Controllers\App\register\RegisterController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/register', [RegisterController::class, 'index'])->name('register');
