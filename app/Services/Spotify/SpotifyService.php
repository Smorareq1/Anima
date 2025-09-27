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
        $mode = session()->pull('spotify.mode', Auth::check() ? 'link' : 'login');

        return DB::transaction(function () use ($spotifyUser, $mode) {
            $existing = ConnectedAccount::where('provider', 'spotify')
                ->where('provider_id', $spotifyUser->getId())
                ->first();

            if ($mode === 'link' && Auth::check()) {
                $user = Auth::user();

            } elseif ($existing && $existing->user) {
                $user = $existing->user;

            } else {
                $email     = $spotifyUser->getEmail();
                // Lo que antes llamabas "name" ahora será tu username
                $username  = $spotifyUser->getName() ?: 'Spotify User';
                $pwd       = bcrypt(Str::random(40));

                if ($email) {
                    $user = User::firstOrCreate(
                        ['email' => $email],
                        [
                            'username'   => $username,
                            'first_name' => null,
                            'last_name'  => null,
                            'password'   => $pwd,
                        ]
                    );
                } else {
                    $user = User::firstOrCreate(
                        ['email' => 'spotify_'.$spotifyUser->getId().'@example.invalid'],
                        [
                            'username'   => $username,
                            'first_name' => null,
                            'last_name'  => null,
                            'password'   => $pwd,
                        ]
                    );
                }
            }

            $connected = $existing ?: new ConnectedAccount([
                'provider'    => 'spotify',
                'provider_id' => $spotifyUser->getId(),
            ]);

            $connected->token         = $spotifyUser->token ?? null;
            $connected->refresh_token = $spotifyUser->refreshToken ?? null;
            $connected->expires_at    = !empty($spotifyUser->expiresIn)
                ? now()->addSeconds((int) $spotifyUser->expiresIn)
                : null;

            $connected->user()->associate($user);
            $connected->save();

            // Si quieres completar solo si está vacío
            if (empty($user->username) && $spotifyUser->getName()) {
                $user->username = $spotifyUser->getName();
                $user->save();
            }

            return $user;
        });
    }
}


