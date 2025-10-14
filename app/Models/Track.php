<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Track extends Model
{
    use HasFactory;

    protected $fillable = [
        'spotify_track_id',
        'name',
        'artist',
        'album',
        'image_url',
        'preview_url',
        'spotify_url',
        'spotify_uri',
        'popularity',
        'explicit',
        'release_date',
    ];

    protected $casts = [
        'explicit' => 'boolean',
        'release_date' => 'date',
    ];

    /**
     * Obtiene todas las playlists que contienen esta canción.
     */
    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(Playlist::class);
    }
}
