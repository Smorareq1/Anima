<?php

// app/Http/Controllers/App/Spotify/SpotifyController.php
namespace App\Http\Controllers\App\Spotify;

use App\Http\Controllers\Controller;
use App\Services\Spotify\SpotifyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SpotifyController extends Controller
{
    public function redirect(Request $request)
    {
        Log::info('Redirecting to Spotify');

        $mode = $request->query('mode', \Auth::check() ? 'link' : 'login');

        $response = Socialite::driver('spotify')
            ->scopes(['user-read-email'])
            ->redirectUrl(config('services.spotify.redirect')) // <- FORZADO
            ->with(['state' => $mode])
            ->redirect();

        // Debug temporal (borra esto luego):
        Log::info('spotify_auth_url', ['url' => $response->getTargetUrl()]);

        return $response;
    }

    public function callback(Request $request, SpotifyService $service)
    {
        $user = $service->handleCallback(); // devuelve el User resuelto
        Auth::login($user, remember: true);

        return redirect()->route('Dashboard');
    }
}
