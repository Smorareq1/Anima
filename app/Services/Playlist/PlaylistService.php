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

            // Crear descripción con las emociones
            $emotionsText = is_array($playlist->emotions_used)
                ? implode(', ', array_column($playlist->emotions_used, 'type'))
                : '';

            $description = "🎭 Emociones: {$emotionsText} | Creada con detección de emociones";

            // Crear playlist en Spotify
            $spotifyPlaylist = $this->spotifyService->createPlaylist(
                $user,
                $playlist->name,
                $description
            );

            if ($spotifyPlaylist) {
                // Agregar tracks a la playlist
                $success = $this->spotifyService->addTracksToPlaylist(
                    $user,
                    $spotifyPlaylist['id'],
                    $trackUris
                );

                if ($success) {
                    $spotifyUrl = $spotifyPlaylist['external_urls']['spotify'] ?? null;

                    // Actualizar la playlist local con los datos de Spotify
                    $playlist->update([
                        'spotify_playlist_id' => $spotifyPlaylist['id'],
                        'spotify_url' => $spotifyUrl, // ✅ Usa la variable
                    ]);

                    Log::info('Playlist sincronizada con Spotify exitosamente', [
                        'playlist_id' => $playlist->id,
                        'spotify_playlist_id' => $spotifyPlaylist['id'],
                        'spotify_url' => $spotifyUrl, // ✅ Verifica en el log
                    ]);
                }
            }
        } catch (Throwable $e) {
            // No fallar toda la transacción si Spotify falla
            Log::error('Error sincronizando con Spotify (no crítico)', [
                'playlist_id' => $playlist->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
