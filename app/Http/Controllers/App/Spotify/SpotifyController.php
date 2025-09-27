<?php

// app/Http/Controllers/App/Spotify/SpotifyController.php
namespace App\Http\Controllers\App\Spotify;

use App\Http\Controllers\Controller;
use App\Services\Spotify\SpotifyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class SpotifyController extends Controller
{
    public function redirect(Request $request)
    {
        Log::info('Redirecting to Spotify');

        $mode = $request->query('mode', Auth::check() ? 'link' : 'login');

        // Guarda tu modo en sesión (NO usar state para esto)
        session(['spotify.mode' => $mode]);

        return Socialite::driver('spotify')
            ->scopes(['user-read-email'])
            ->redirectUrl(config('services.spotify.redirect'))
            ->redirect();
    }

    public function callback(Request $request, SpotifyService $service)
    {
        $user = $service->handleCallback();
        Auth::login($user, remember: true);
        return Inertia::render('Dashboard/HomeDashboard');
    }
}
