<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'main_emotion',
        'emotions_used',
        'spotify_playlist_id',
        'spotify_url',
        'playlist_image'
    ];

    protected $casts = [
        'emotions_used' => 'array', // Laravel convierte automáticamente el JSON a y desde un array.
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tracks(): BelongsToMany
    {
        return $this->belongsToMany(Track::class);
    }

    public function isSpotifySynced(): bool
    {
        return !empty($this->spotify_playlist_id);
    }
}
