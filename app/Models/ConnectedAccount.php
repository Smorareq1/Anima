<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Representa una cuenta de un proveedor externo (como Spotify)
 * vinculada a un usuario del sistema.
 */
class ConnectedAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'provider_id',
        'token',
        'refresh_token',
        'expires_at',
    ];

    protected $casts = [
        // Convierte el token de acceso a un string encriptado/desencriptado automáticamente.
        'token' => 'encrypted',

        // Hace lo mismo para el refresh token.
        'refresh_token' => 'encrypted',

        // Convierte la marca de tiempo 'expires_at' en un objeto Carbon.
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
