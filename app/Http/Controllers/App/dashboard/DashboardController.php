<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Obtener playlistData de la sesión si existe
        $playlistData = $request->session()->get('playlistData');
        return Inertia::render('Dashboard/HomeDashboard', [
            'playlistData' => $playlistData,
        ]);
    }
}
