<?php

namespace App\Services\App\dashboard;

use App\Models\User;
use App\Models\Playlist;
use App\Models\Track;
use App\Models\ConnectedAccount;
use Carbon\Carbon;

class AdminDashboardService
{
    /**
     * Obtiene todos los datos necesarios para el dashboard de administrador
     */
    public function getDashboardData(): array
    {
        return [
            'usuarioMasActivo' => $this->getMostActiveUser(),
            'cancionMasEscuchada' => $this->getMostPopularTrack(),
            'emocionMasPopular' => $this->getMostPopularEmotion(),
            'cancionesRecomendadas' => $this->getTopTracks(),
            'usuariosActivos' => $this->getActiveUsersByMonth(),
            'emocionesPopulares' => $this->getPopularEmotions(),
            'usuariosSpotify' => $this->getSpotifyUsersByMonth(),
        ];
    }

    /**
     * Obtiene el usuario más activo basado en el número de playlists creadas
     */
    private function getMostActiveUser(): array
    {
        $user = User::select('id', 'first_name', 'last_name', 'username', 'avatar')
            ->withCount('playlists')
            ->orderBy('playlists_count', 'desc')
            ->first();

        if (!$user) {
            return [
                'nombre' => 'Sin usuarios',
                'imagen' => '/images/default-avatar.png',
            ];
        }

        $nombre = trim($user->first_name . ' ' . $user->last_name) ?: $user->username;

        return [
            'nombre' => $nombre,
            'imagen' => $user->avatar ?: '/images/curry.png',
            'playlistsCreadas' => $user->playlists_count,
        ];
    }

    /**
     * Obtiene la canción más popular basada en cuántas playlists la contienen
     * Nota: Necesitaríamos una tabla pivot playlist_track para esto
     * Por ahora retornamos la canción más reciente como fallback
     */
    private function getMostPopularTrack(): array
    {
        $track = Track::orderBy('popularity', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$track) {
            return [
                'titulo' => 'Sin canciones',
                'artista' => 'N/A',
                'veces' => 0,
                'imagen' => '/images/default-song.jpg',
            ];
        }

        return [
            'titulo' => $track->name,
            'artista' => $track->artist,
            'veces' => $track->popularity ?? 0,
            'imagen' => $track->image_url ?: '/images/default-song.jpg',
        ];
    }

    /**
     * Obtiene la emoción más popular basada en las playlists
     */
    private function getMostPopularEmotion(): array
    {
        $emotion = Playlist::select('main_emotion')
            ->groupBy('main_emotion')
            ->orderByRaw('COUNT(*) DESC')
            ->first();

        if (!$emotion) {
            return [
                'nombre' => 'Sin emociones',
                'icono' => '😐',
            ];
        }

        $emotionIcons = [
            'HAPPY' => '😊',
            'SAD' => '😢',
            'ANGRY' => '😡',
            'CONFUSED' => '😕',
            'DISGUSTED' => '🤢',
            'SURPRISED' => '😲',
            'CALM' => '😌',
            'UNKNOWN' => '😐',
            'FEAR' => '😨',
        ];

        return [
            'nombre' => $emotion->main_emotion,
            'icono' => $emotionIcons[$emotion->main_emotion] ?? '🎵',
        ];
    }

    /**
     * Obtiene las top 5 canciones más populares
     */
    private function getTopTracks(): array
    {
        $tracks = Track::orderBy('popularity', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return $tracks->map(function ($track) {
            return [
                'nombre' => $track->name,
                'artista' => $track->artist,
                'veces' => $track->popularity ?? 0,
                'imagen' => $track->image_url ?: '/images/default-song.jpg'
            ];
        })->toArray();
    }

    /**
     * Obtiene el número de usuarios activos por mes (últimos 3 meses)
     */
    private function getActiveUsersByMonth(): array
    {
        $months = [];
        $monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        for ($i = 2; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $activeUsers = User::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->orWhereHas('playlists', function ($query) use ($startOfMonth, $endOfMonth) {
                    $query->whereBetween('created_at', [$startOfMonth, $endOfMonth]);
                })
                ->distinct()
                ->count();

            $months[] = [
                'mes' => $monthNames[$date->month - 1],
                'valor' => $activeUsers
            ];
        }

        return $months;
    }

    /**
     * Obtiene las emociones más populares con su conteo
     */
    private function getPopularEmotions(): array
    {
        $emotions = Playlist::select('main_emotion')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('main_emotion')
            ->orderBy('total', 'desc')
            ->take(4)
            ->get();

        return $emotions->map(function ($emotion) {
            return [
                'nombre' => $emotion->main_emotion,
                'valor' => $emotion->total
            ];
        })->toArray();
    }

    /**
     * Obtiene el número de usuarios conectados a Spotify por mes (últimos 3 meses)
     */
    private function getSpotifyUsersByMonth(): array
    {
        $months = [];
        $monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        for ($i = 2; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $spotifyUsers = ConnectedAccount::where('provider', 'spotify')
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->distinct('user_id')
                ->count();

            $months[] = [
                'mes' => $monthNames[$date->month - 1],
                'valor' => $spotifyUsers
            ];
        }

        return $months;
    }

    /**
     * Obtiene estadísticas generales del dashboard
     */
    public function getGeneralStats(): array
    {
        return [
            'totalUsuarios' => User::count(),
            'totalPlaylists' => Playlist::count(),
            'totalCanciones' => Track::count(),
            'usuariosConSpotify' => ConnectedAccount::where('provider', 'spotify')->distinct('user_id')->count(),
        ];
    }
}
