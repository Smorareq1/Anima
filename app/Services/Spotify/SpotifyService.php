<?php

// app/Services/Spotify/SpotifyService.php
namespace App\Services\Spotify;

use App\Models\User;
use App\Models\ConnectedAccount;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
                $email    = $spotifyUser->getEmail();
                $username = $spotifyUser->getName() ?: 'Spotify User';
                $avatar   = $spotifyUser->getAvatar();
                $pwd      = bcrypt(Str::random(40));

                $user = User::firstOrCreate(
                    ['email' => $email ?? 'spotify_'.$spotifyUser->getId().'@example.invalid'],
                    [
                        'username'   => $username,
                        'first_name' => null,
                        'last_name'  => null,
                        'password'   => $pwd,
                        'avatar'     => $avatar,
                    ]
                );


                if (empty($user->avatar) && $avatar) {
                    $user->avatar = $avatar;
                    $user->save();
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
            return $user;
        });
    }

}


