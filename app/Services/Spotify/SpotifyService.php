<?php

namespace App\Services\Spotify;

use App\Models\User;
use App\Models\ConnectedAccount;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;

class SpotifyService
{

    public function handleCallback(): User
    {
        // 1. Obtiene los datos del usuario desde Spotify
        $spotifyUser = Socialite::driver('spotify')->user();

        // 2. Ejecuta la lógica dentro de una transacción para asegurar la integridad de los datos
        return DB::transaction(function () use ($spotifyUser) {

            // 3. Busca o crea la cuenta conectada
            $connectedAccount = ConnectedAccount::updateOrCreate(
                [
                    'provider' => 'spotify',
                    'provider_id' => $spotifyUser->getId(),
                ],
                [
                    'token' => $spotifyUser->token,
                    'refresh_token' => $spotifyUser->refreshToken,
                    'expires_at' => now()->addSeconds($spotifyUser->expiresIn),
                ]
            );

            // 4. Si la cuenta conectada ya tiene un usuario, lo retornamos.
            if ($connectedAccount->user) {
                return $connectedAccount->user;
            }

            // 5. Si no, buscamos o creamos un usuario con el email de Spotify
            $user = User::firstOrCreate(
                [
                    'email' => $spotifyUser->getEmail(),
                ],
                [
                    'name' => $spotifyUser->getName(),
                    'password' => null, // La contraseña es null ya que se autentica vía Spotify
                ]
            );

            // 6. Asociamos la cuenta conectada con el usuario y guardamos
            $connectedAccount->user()->associate($user);
            $connectedAccount->save();

            return $user;
        });
    }
}
