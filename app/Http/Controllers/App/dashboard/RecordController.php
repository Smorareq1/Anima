<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Playlist;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class RecordController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;
        $emotion = $request->query('emotion', null);

        $favoritePlaylistIds = $user->favoritePlaylists()->pluck('playlists.id')->toArray();

        $query = Playlist::withCount('tracks')
            ->where('user_id', $userId)
            ->orderByDesc('created_at');

        if ($emotion) {
            $query->where('main_emotion', strtoupper($emotion));
        }

        $playlists = $query->paginate(6);


        $playlists->getCollection()->transform(function ($playlist) use ($favoritePlaylistIds) {
            $imageUrl = $playlist->playlist_image;

            if ($imageUrl) {
                // Si no es una URL completa (de Spotify), es un archivo local (collage).
                if (!Str::startsWith($imageUrl, 'http')) {
                    $imageUrl = Storage::url($imageUrl);
                }
            } else {
                // Si no hay imagen, usamos el helper asset() para la imagen por defecto.
                $imageUrl = asset('images/mock/default.jpg');
            }

            return [
                'id'            => $playlist->id,
                'name'          => $playlist->name,
                'emotion'       => $playlist->main_emotion,
                'spotify_url'   => $playlist->spotify_url,
                'date'          => $playlist->created_at->format('Y-m-d'),
                'songs'         => $playlist->tracks_count,
                'image'         => $imageUrl,
                'isInitiallyFavorite' => in_array($playlist->id, $favoritePlaylistIds),
            ];
        });

        $summary = DB::table('playlists')
            ->join('playlist_track', 'playlists.id', '=', 'playlist_track.playlist_id')
            ->where('playlists.user_id', $userId)
            ->select(
                'playlists.main_emotion as emotion',
                DB::raw('COUNT(DISTINCT playlists.id) as playlists'),
                DB::raw('COUNT(playlist_track.track_id) as songs')
            )
            ->groupBy('playlists.main_emotion')
            ->get();

        return Inertia::render('Dashboard/Record', [
            'playlists'   => $playlists->items(),
            'pagination'  => [
                'current_page' => $playlists->currentPage(),
                'per_page'     => $playlists->perPage(),
                'total'        => $playlists->total(),
            ],
            'summaryData' => $summary,
            'currentEmotion' => $emotion,
        ]);
    }
}
