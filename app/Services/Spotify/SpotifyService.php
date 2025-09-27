<?php

// app/Services/Spotify/SpotifyService.php
namespace App\Services\Spotify;

use App\Models\User;
use App\Models\ConnectedAccount;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SpotifyService
{
    public function handleCallback(): User
    {
        // Socialite stateful (no ->stateless())
        $spotifyUser = Socialite::driver('spotify')->user();

        // Recupera tu modo guardado en el redirect (login|link)
        $mode = session()->pull('spotify.mode', Auth::check() ? 'link' : 'login');

        return DB::transaction(function () use ($spotifyUser, $mode) {
            // ¿Ya existe la cuenta conectada?
            $existing = ConnectedAccount::where('provider', 'spotify')
                ->where('provider_id', $spotifyUser->getId())
                ->first();

            // 1) Resolver el User de la app
            if ($mode === 'link' && Auth::check()) {
                // Vincular a la sesión actual
                $user = Auth::user();

            } elseif ($existing && $existing->user) {
                // Reusar el user ya vinculado (login)
                $user = $existing->user;

            } else {
                $email = $spotifyUser->getEmail();
                $name  = $spotifyUser->getName() ?: 'Spotify User';
                $pwd   = bcrypt(Str::random(40));

                $user = $email
                    ? User::firstOrCreate(['email' => $email], ['name' => $name, 'password' => $pwd])
                    : User::firstOrCreate(
                        ['email' => 'spotify_'.$spotifyUser->getId().'@example.invalid'],
                        ['name' => $name, 'password' => $pwd]
                    );
            }

            // 2) Crear/actualizar la ConnectedAccount SIEMPRE con user_id
            $connected = $existing ?: new ConnectedAccount([
                'provider'    => 'spotify',
                'provider_id' => $spotifyUser->getId(),
            ]);

            $connected->token         = $spotifyUser->token ?? null;
            $connected->refresh_token = $spotifyUser->refreshToken ?? null;
            $connected->expires_at    = !empty($spotifyUser->expiresIn)
                ? now()->addSeconds((int) $spotifyUser->expiresIn)
                : null;

            // Asociar con el usuario resuelto (evita el NOT NULL violation)
            $connected->user()->associate($user);
            $connected->save();

            // (Opcional) Completar nombre si estaba vacío
            if (empty($user->name) && $spotifyUser->getName()) {
                $user->name = $spotifyUser->getName();
                $user->save();
            }

            return $user;
        });
    }
}

