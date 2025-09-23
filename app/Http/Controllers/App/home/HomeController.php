<?php

namespace App\Http\Controllers\App\home;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home', [
            'mensaje' => 'Bienvenido a Anima 🚀',
        ]);
    }
}
