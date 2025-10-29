<?php

namespace App\Services\Playlist;

use App\Models\Playlist;
use App\Models\Track;
use App\Services\Spotify\SpotifyService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class PlaylistService
{

    protected $spotifyService;

    public function __construct(SpotifyService $spotifyService)
    {
        $this->spotifyService = $spotifyService;
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
                        'duration_ms' => $trackData['duration_ms'], // <-- ¡LA PIEZA QUE FALTABA!
                        'popularity' => $trackData['popularity'],
                        'explicit' => $trackData['explicit'],
                        'release_date' => $trackData['release_date'],
                    ]
                );
                $trackIds[] = $track->id;
                $trackUris[] = $trackData['uri'];
            }

            if (!empty($trackIds)) {
                $playlist->tracks()->attach($trackIds);
            }

            if ($user->hasSpotify()) {
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
                    // 1. Volvemos a pedir los datos de la playlist para obtener la imagen
                    $updatedPlaylistDetails = $this->spotifyService->getPlaylistDetails($user, $spotifyPlaylistId);

                    // 2. Extraemos la URL de la imagen (usualmente la primera es la más grande)
                    $imageUrl = $updatedPlaylistDetails['images'][0]['url'] ?? null;

                    // 3. Obtenemos la URL de Spotify
                    $spotifyUrl = $updatedPlaylistDetails['external_urls']['spotify'] ?? $spotifyPlaylist['external_urls']['spotify'] ?? null;

                    // 4. Actualizamos la playlist local con TODOS los datos de Spotify
                    $playlist->update([
                        'spotify_playlist_id' => $spotifyPlaylistId,
                        'spotify_url'         => $spotifyUrl,
                        'playlist_image'      => $imageUrl,
                    ]);

                    Log::info('Playlist sincronizada con Spotify exitosamente', [
                        'playlist_id'         => $playlist->id,
                        'spotify_playlist_id' => $spotifyPlaylistId,
                        'spotify_url'         => $spotifyUrl,
                        'playlist_image_url'  => $imageUrl,
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
