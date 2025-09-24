<?php


use App\Http\Controllers\App\home\HomeController;
use App\Http\Controllers\App\register\RegisterController;
use App\Http\Controllers\App\login\LoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', [HomeController::class, 'index'])->name('Home');
Route::get('/register', [RegisterController::class, 'index'])->name('Register');
Route::get('/login', [LoginController::class, 'index'])->name('Login');
