<?php

namespace App\Http\Controllers\App\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\Playlist;
use App\Models\Track;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $mustCompleteProfile = empty($user->first_name) || empty($user->last_name);

        $ultimasPlaylists = Playlist::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->withCount('tracks')
            ->get()
            ->map(function ($playlist) {
                $imageUrl = $playlist->playlist_image;

                if ($imageUrl) {
                    // si la ruta no es http (es local)
                    if (!Str::startsWith($imageUrl, 'http')) {
                        $imageUrl = Storage::url($imageUrl);
                    }
                } else {
                    $imageUrl = asset('images/mock/default.jpg');
                }

                return [
                    'id' => $playlist->id,
                    'name' => $playlist->name,
                    'emotion' => strtoupper($playlist->main_emotion ?? 'UNKNOWN'),
                    'songs' => $playlist->tracks_count,
                    'date' => $playlist->created_at->toDateString(),
                    'image' => $imageUrl,
                ];
            });

        $ultimaPlaylist = Playlist::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->with('tracks')
            ->first();

        $ultimosTracks = [];

        if ($ultimaPlaylist) {
            $ultimosTracks = $ultimaPlaylist->tracks
                ->map(function ($track) {
                    $imageUrl = $track->image_url;

                    if ($imageUrl) {
                        if (!Str::startsWith($imageUrl, 'http')) {
                            $imageUrl = Storage::url($imageUrl);
                        }
                    } else {
                        $imageUrl = asset('images/mock/default.jpg');
                    }

                    return [
                        'id' => $track->id,
                        'titulo' => $track->name,
                        'artista' => $track->artist,
                        'album' => $track->album,
                        'duracion' => gmdate('i:s', $track->duration_ms / 1000),
                        'imagen' => $imageUrl,
                        'spotify_url' => $track->spotify_url,
                    ];
                });
        }

        return Inertia::render('Dashboard/HomeDashboard', [
            'recientesData' => [
                'ultimasPlaylists' => $ultimasPlaylists,
                'ultimasCanciones' => $ultimosTracks,
            ],
            'mustCompleteProfile' => $mustCompleteProfile,
        ]);
    }
}
