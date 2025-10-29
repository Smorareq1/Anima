<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject; // <-- Importa la interfaz de JWT

class User extends Authenticatable implements JWTSubject // <-- Implementa la interfaz de JWT
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'first_name',
        'last_name',
        'email',
        'password',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function favoritePlaylists(): BelongsToMany
    {
        return $this->belongsToMany(Playlist::class, 'user_playlist_favorites');
    }

    // --- MÉTODOS DE SPOTIFY (QUE SE HABÍAN BORRADO) ---
    public function playlists(): HasMany
    {
        return $this->hasMany(Playlist::class);
    }

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
        // Asumiendo que tu ConnectedAccount tiene un método isValid()
        // Si no lo tiene, puedes usar: return (bool) $account;
        return $account && method_exists($account, 'isValid') ? $account->isValid() : (bool) $account;
    }

    public function hasSpotifyConnected(): bool
    {
        return $this->connectedAccounts()
            ->where('provider', 'spotify')
            ->exists();
    }

    // --- MÉTODOS DE JWT (QUE AÑADIMOS) ---
    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}
