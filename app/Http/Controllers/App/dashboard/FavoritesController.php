<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FavoritesController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $favoritePlaylists = $user->favoritePlaylists()->get()->map(function ($playlist) {
            return [
                'id' => $playlist->id,
                'name' => $playlist->name,
                'songs' => $playlist->tracks()->count(),
                'date' => $playlist->created_at->toDateString(),
                'image' => $playlist->playlist_image,
                'isInitiallyFavorite' => true, // Siempre es favorito en esta vista
            ];
        });

        return Inertia::render('Dashboard/Favorites', [
            'user' => $user,
            'favoritosData' => [
                'playlistsFavoritas' => $favoritePlaylists,
                'cancionesFavoritas' => [], // Aún con datos mock
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

        // Usamos el método toggle de la relación para sincronizar el favorito
        $user->favoritePlaylists()->toggle($playlistId);

        // Verificamos si la playlist ahora es favorita para devolver el estado correcto
        $isFavorite = $user->favoritePlaylists()->where('playlist_id', $playlistId)->exists();

        return response()->json(['status' => $isFavorite ? 'added' : 'removed']);
    }
}
