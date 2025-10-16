<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class FavoritesController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Dashboard/Favorites', [
            'user' => Auth::user(),
        ]);
    }
}
