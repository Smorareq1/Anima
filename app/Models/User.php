<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{

    protected $fillable = [
        'username',
        'first_name',
        'last_name',
        'email',
        'password',
        'avatar',
    ];


    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function playlists(): HasMany
    {
        return $this->hasMany(Playlist::class);
    }
    //Spotify
    public function connectedAccounts(): HasMany
    {
        return $this->hasMany(ConnectedAccount::class);
    }
    public function spotifyAccount()
    {
        return $this->connectedAccounts()
            ->where('provider', 'spotify')
            ->first();
    }
    public function hasSpotify(): bool
    {
        $account = $this->spotifyAccount();
        return $account && $account->isValid();
    }
    public function hasSpotifyConnected(): bool
    {
        return $this->connectedAccounts()
            ->where('provider', 'spotify')
            ->exists();
    }
}
