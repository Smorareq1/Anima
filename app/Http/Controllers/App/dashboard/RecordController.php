<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Playlist;
use Illuminate\Support\Facades\DB;

class RecordController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // 🔹 Obtener playlists con conteo de tracks
        $playlists = Playlist::withCount('tracks')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate(6);

        // 🔹 Transformar al formato esperado por el frontend
        $playlists->getCollection()->transform(function ($playlist) {
            return [
                'id'            => $playlist->id,
                'name'          => $playlist->name,
                'emotion'       => $playlist->main_emotion,
                'spotify_url'   => $playlist->spotify_url,
                'date'          => $playlist->created_at->format('Y-m-d'),
                'songs'         => $playlist->tracks_count,
                'image'         => $playlist->playlist_image ?? '/images/mock/default.jpg',
            ];
        });

        // 🔹 Resumen real (usa la tabla pivote playlist_track)
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
        ]);
    }
}
