<?php

// app/Http/Controllers/App/Spotify/SpotifyController.php
namespace App\Http\Controllers\App\Spotify;

use App\Http\Controllers\Controller;
use App\Services\Spotify\SpotifyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use App\Services\amazon\RekognitionService;


class SpotifyController extends Controller
{

    public function redirect(Request $request)
    {
        Log::info('Redirecting to Spotify');

        $mode = $request->query('mode', Auth::check() ? 'link' : 'login');

        // Guarda tu modo en sesión (NO usar state para esto)
        session(['spotify.mode' => $mode]);

        return Socialite::driver('spotify')
            ->scopes(config('services.spotify.scopes'))
            ->redirectUrl(config('services.spotify.redirect'))
            ->redirect();
    }

    public function callback(Request $request, SpotifyService $service)
    {
        try {
            $user = $service->handleCallback();
            Auth::login($user, remember: true);
        } catch (InvalidStateException $e) {
            Log::info("Spotify session expired");
            return redirect()->route('auth.login.show')
                ->with('error', 'La sesión de Spotify caducó. Intenta de nuevo.');
        }

        return redirect()->intended(route('Dashboard'));
    }
}
