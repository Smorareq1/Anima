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
        $spotifyUser = Socialite::driver('spotify')->user();
        $mode = request()->input('state', Auth::check() ? 'link' : 'login');

        return DB::transaction(function () use ($spotifyUser, $mode) {
            // upsert de la cuenta conectada por provider + provider_id
            $connected = ConnectedAccount::updateOrCreate(
                [
                    'provider' => 'spotify',
                    'provider_id' => $spotifyUser->getId(),
                ],
                [
                    'token'         => $spotifyUser->token ?? null,
                    'refresh_token' => $spotifyUser->refreshToken ?? null,
                    'expires_at'    => $spotifyUser->expiresIn
                        ? now()->addSeconds($spotifyUser->expiresIn)
                        : null,
                ]
            );

            // Si ya está vinculada a un usuario y estamos en login, úsalo
            if ($connected->user && $mode !== 'link') {
                return $connected->user;
            }

            // Si estamos linkeando y hay usuario autenticado, asociar a ese
            if ($mode === 'link' && Auth::check()) {
                $connected->user()->associate(Auth::user());
                $connected->save();
                return Auth::user();
            }

            // Flujo de login normal: buscar/crear por email
            $email = $spotifyUser->getEmail(); // puede venir null
            $name  = $spotifyUser->getName() ?: 'Spotify User';

            // Opción A: si tu columna password es NOT NULL, genera una aleatoria segura
            $randomPassword = bcrypt(Str::random(40));

            $user = $email
                ? User::firstOrCreate(
                    ['email' => $email],
                    ['name' => $name, 'password' => $randomPassword]
                )
                : User::create([
                    // si no hay email, crea uno sintético (o muestra UI pidiendo correo)
                    'email'    => "spotify_{$spotifyUser->getId()}@example.invalid",
                    'name'     => $name,
                    'password' => $randomPassword,
                ]);

            $connected->user()->associate($user);
            $connected->save();

            return $user;
        });
    }
}

