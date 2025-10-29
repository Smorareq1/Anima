<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class FavoritesController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $favoritePlaylists = $user->favoritePlaylists()->with('tracks')->get();

        $formattedPlaylists = $favoritePlaylists->map(function ($playlist) {
            return [
                'id' => $playlist->id,
                'name' => $playlist->name,
                'songs' => $playlist->tracks->count(),
                'date' => $playlist->created_at->toDateString(),
                'image' => $playlist->playlist_image,
                'isInitiallyFavorite' => true,
            ];
        });

        $uniqueTracks = $favoritePlaylists
            ->flatMap(fn($playlist) => $playlist->tracks)
            ->unique('id');

        $formattedTracks = $uniqueTracks->map(function ($track) {
            return [
                'id' => $track->id,
                'titulo' => $track->name,
                'artista' => $track->artist,
                'album' => $track->album,
                'duracion' => gmdate('i:s', $track->duration_ms / 1000),
                'imagen' => $track->image_url,
                'spotify_url' => $track->spotify_url, // <-- Añadido
            ];
        })->values();

        return Inertia::render('Dashboard/Favorites', [
            'user' => $user,
            'favoritosData' => [
                'playlistsFavoritas' => $formattedPlaylists,
                'cancionesFavoritas' => $formattedTracks,
            ],
        ]);
    }

    public function toggleFavorite(Request $request)
    {
        $request->validate([
            'playlist_id' => 'required|integer|exists:playlists,id',
        ]);

        $user = Auth::user();
        $playlistId = $request->input('playlist_id');

        $user->favoritePlaylists()->toggle($playlistId);

        $isFavorite = $user->favoritePlaylists()->where('playlist_id', $playlistId)->exists();

        return response()->json(['status' => $isFavorite ? 'added' : 'removed']);
    }
}
