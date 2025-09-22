<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home', [
        'mensaje' => 'Bienvenido a Anima 🚀',
    ]);
})->name('home');

//ruta de registro
Route::get('/register', function () {
    return Inertia::render('Register');
})->name('register');
