<?php

namespace App\Services\Playlist;

use App\Models\Playlist;
use App\Models\Track;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class PlaylistService
{

    public function createPlaylistFromRecommendation(string $playlistName, array $recommendationData): Playlist
    {
        return DB::transaction(function () use ($recommendationData, $playlistName) {
            $playlist = Playlist::create([
                'user_id' => Auth::id(),
                'name' => $playlistName,
                'main_emotion' => $recommendationData['emotion'],
                'emotions_used' => $recommendationData['emotions_used'],
            ]);
            $trackIds = [];
            foreach ($recommendationData['tracks'] as $trackData) {
                $track = Track::firstOrCreate(
                    ['spotify_track_id' => $trackData['id']],
                    [
                        'name' => $trackData['name'],
                        'artist' => $trackData['artist'],
                        'album' => $trackData['album'],
                        'image_url' => $trackData['image'],
                        'preview_url' => $trackData['preview_url'],
                        'spotify_url' => $trackData['url'],
                        'spotify_uri' => $trackData['uri'],
                        'popularity' => $trackData['popularity'],
                        'explicit' => $trackData['explicit'],
                        'release_date' => $trackData['release_date'],
                    ]
                );
                $trackIds[] = $track->id;
            }
            if (!empty($trackIds)) {
                $playlist->tracks()->attach($trackIds);
            }
            return $playlist;
        });
    }
}
