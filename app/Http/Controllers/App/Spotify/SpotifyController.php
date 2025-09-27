<?php

namespace App\Http\Controllers\App\Spotify;

use App\Http\Controllers\Controller;
use App\Services\Spotify\SpotifyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class SpotifyController extends Controller
{
    protected $spotifyService;

    // Inyectamos nuestro servicio para usarlo en los métodos
    public function __construct(SpotifyService $spotifyService)
    {
        $this->spotifyService = $spotifyService;
    }

    /**
     * Redirige al usuario a Spotify para que autorice la aplicación.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('spotify')
            ->scopes(['user-read-email']) // Pide los permisos que necesites
            ->redirect();
    }

    /**
     * Maneja la respuesta (callback) de Spotify.
     */
    public function callback(): RedirectResponse
    {
        try {
            $user = $this->spotifyService->handleCallback();

            // Inicia sesión para el usuario encontrado o creado
            Auth::login($user, true); // 'true' para "recordar" la sesión

            return redirect()->intended('/dashboard'); // Redirige al dashboard o a donde quieras

        } catch (Exception $e) {
            // Manejo de errores (ej. el usuario denegó el acceso)
            return redirect()->route('login')->with('error', 'No se pudo autenticar con Spotify.');
        }
    }
}
