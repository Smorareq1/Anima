<?php

namespace App\Services\Playlist;

use App\Models\Playlist;
use App\Models\Track;
use App\Services\Image\ImageCollageService;
use App\Services\Spotify\SpotifyService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class PlaylistService
{
    protected $spotifyService;
    protected $collageService;

    public function __construct(SpotifyService $spotifyService, ImageCollageService $collageService)
    {
        $this->spotifyService = $spotifyService;
        $this->collageService = $collageService;
    }

    public function createPlaylistFromRecommendation(string $playlistName, array $recommendationData): Playlist
    {
        return DB::transaction(function () use ($recommendationData, $playlistName) {
            $user = Auth::user();

            $playlist = Playlist::create([
                'user_id' => $user->id,
                'name' => $playlistName,
                'main_emotion' => $recommendationData['emotion'],
                'emotions_used' => $recommendationData['emotions_used'],
            ]);

            $trackIds = [];
            $trackUris = [];
            $trackImageUrls = [];

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
                        'duration_ms' => $trackData['duration_ms'],
                        'popularity' => $trackData['popularity'],
                        'explicit' => $trackData['explicit'],
                        'release_date' => $trackData['release_date'],
                    ]
                );
                $trackIds[] = $track->id;
                $trackUris[] = $trackData['uri'];
                if (count($trackImageUrls) < 4) {
                    $trackImageUrls[] = $trackData['image'];
                }
            }

            if (!empty($trackIds)) {
                $playlist->tracks()->attach($trackIds);
            }

            // Si el usuario NO tiene Spotify, creamos un collage como imagen de portada.
            if (!$user->hasSpotifyConnected()) {
                if (!empty($trackImageUrls)) {
                    $collagePath = $this->collageService->createFromUrls($trackImageUrls);
                    if ($collagePath) {
                        $playlist->playlist_image = $collagePath;
                        $playlist->save();
                    }
                }
            } else {
                // Si tiene Spotify, sincronizamos la playlist para obtener la portada oficial.
                $this->syncToSpotify($playlist, $trackUris);
            }

            return $playlist;
        });
    }


    protected function syncToSpotify(Playlist $playlist, array $trackUris): void
    {
        try {
            $user = $playlist->user;

            $emotionsText = is_array($playlist->emotions_used)
                ? implode(', ', array_column($playlist->emotions_used, 'type'))
                : '';
            $description = "🎭 Emociones: {$emotionsText} | Creada con detección de emociones";

            $spotifyPlaylist = $this->spotifyService->createPlaylist(
                $user,
                $playlist->name,
                $description
            );

            if ($spotifyPlaylist && !empty($spotifyPlaylist['id'])) {
                $spotifyPlaylistId = $spotifyPlaylist['id'];

                $success = $this->spotifyService->addTracksToPlaylist(
                    $user,
                    $spotifyPlaylistId,
                    $trackUris
                );

                if ($success) {
                    $updatedPlaylistDetails = $this->spotifyService->getPlaylistDetails($user, $spotifyPlaylistId);
                    $imageUrl = $updatedPlaylistDetails['images'][0]['url'] ?? null;
                    $spotifyUrl = $updatedPlaylistDetails['external_urls']['spotify'] ?? $spotifyPlaylist['external_urls']['spotify'] ?? null;

                    $playlist->update([
                        'spotify_playlist_id' => $spotifyPlaylistId,
                        'spotify_url'         => $spotifyUrl,
                        'playlist_image'      => $imageUrl,
                    ]);

                    Log::info('Playlist sincronizada con Spotify exitosamente', [
                        'playlist_id'         => $playlist->id,
                        'spotify_playlist_id' => $spotifyPlaylistId,
                    ]);
                }
            }
        } catch (Throwable $e) {
            Log::error('Error sincronizando con Spotify (no crítico)', [
                'playlist_id' => $playlist->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
