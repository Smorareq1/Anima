<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPlaylistFavorite extends Model
{
    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'user_playlist_favorites';

    /**
     * La clave primaria de la tabla.
     * Como es una tabla pivot con clave primaria compuesta, no usamos incrementing
     */
    public $incrementing = false;

    /**
     * Indica si el modelo debe ser timestamped.
     * La migración no incluye timestamps, así que lo deshabilitamos
     */
    public $timestamps = false;

    /**
     * Los atributos que son asignables en masa.
     */
    protected $fillable = [
        'user_id',
        'playlist_id',
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     */
    protected $casts = [
        'user_id' => 'integer',
        'playlist_id' => 'integer',
    ];

    /**
     * Relación con el modelo User.
     * Un favorito pertenece a un usuario.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el modelo Playlist.
     * Un favorito pertenece a una playlist.
     */
    public function playlist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class);
    }

    /**
     * Scope para obtener favoritos de un usuario específico.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para obtener favoritos de una playlist específica.
     */
    public function scopeForPlaylist($query, $playlistId)
    {
        return $query->where('playlist_id', $playlistId);
    }

    /**
     * Método estático para verificar si una playlist es favorita de un usuario.
     */
    public static function isFavorite($userId, $playlistId): bool
    {
        return static::where('user_id', $userId)
            ->where('playlist_id', $playlistId)
            ->exists();
    }

    /**
     * Método estático para agregar una playlist a favoritos.
     */
    public static function addFavorite($userId, $playlistId): bool
    {
        return static::firstOrCreate([
                'user_id' => $userId,
                'playlist_id' => $playlistId,
            ]) !== null;
    }

    /**
     * Método estático para remover una playlist de favoritos.
     */
    public static function removeFavorite($userId, $playlistId): bool
    {
        return static::where('user_id', $userId)
                ->where('playlist_id', $playlistId)
                ->delete() > 0;
    }

    /**
     * Método estático para toggle (agregar/quitar) favorito.
     */
    public static function toggleFavorite($userId, $playlistId): bool
    {
        $favorite = static::where('user_id', $userId)
            ->where('playlist_id', $playlistId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return false; // Se removió de favoritos
        } else {
            static::create([
                'user_id' => $userId,
                'playlist_id' => $playlistId,
            ]);
            return true; // Se agregó a favoritos
        }
    }

    /**
     * Obtener el conteo de favoritos para una playlist.
     */
    public static function getFavoriteCount($playlistId): int
    {
        return static::where('playlist_id', $playlistId)->count();
    }

    /**
     * Obtener las playlists favoritas de un usuario con sus datos.
     */
    public static function getUserFavoritePlaylists($userId)
    {
        return static::with(['playlist.user'])
            ->where('user_id', $userId)
            ->get()
            ->pluck('playlist');
    }

    /**
     * Obtener los usuarios que marcaron como favorita una playlist.
     */
    public static function getPlaylistFavoriteUsers($playlistId)
    {
        return static::with('user')
            ->where('playlist_id', $playlistId)
            ->get()
            ->pluck('user');
    }
}
