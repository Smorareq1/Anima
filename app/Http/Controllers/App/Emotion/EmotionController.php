<?php

namespace App\Http\Controllers\App\Emotion;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use App\Models\Track;
use App\Services\amazon\RekognitionService;
use App\Services\Playlist\PlaylistService;
use App\Services\Spotify\SpotifyService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Log;
use Throwable;

class EmotionController extends Controller
{

    protected $rekognition;

    public function __construct(RekognitionService $rekognition)
    {
        $this->rekognition = $rekognition;
    }

    public function firstTime()
    {
        return Inertia::render('FirstTimeUpload');
    }

    public function recommend()
    {
        return Inertia::render('Dashboard/Recommend');
    }

    public function upload(Request $request, SpotifyService $spotify, RekognitionService $rekognition)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png|max:10240',
        ]);

        try {
            $limit = 12;

            // Leer el archivo directamente sin guardarlo
            $imageContent = file_get_contents($request->file('photo')->getRealPath());
            $emotions = $rekognition->detectEmotion($imageContent, 3);

            if (empty($emotions)) {
                return back()->withErrors(['photo' => 'No se detectaron emociones en la imagen']);
            }

            $recs = $spotify->recommendByEmotionsEnhanced(Auth::user(), $emotions, $limit);

            $request->session()->put('playlistData', [
                'message' => 'Análisis y recomendaciones generadas',
                'emotions' => $emotions,
                'emotions_used' => $recs['emotions_used'] ?? null,
                'method_used' => $recs['method'] ?? 'hybrid',
                'emotion' => $recs['emotion'] ?? null,
                'confidence' => $recs['confidence'] ?? null,
                'tracks' => $recs['tracks'] ?? [],
            ]);

            return redirect()->route('emotion.playlists.temp');

        } catch (\Throwable $e) {
            Log::error('Upload error: ' . $e->getMessage());
            return back()->withErrors(['photo' => 'Error al procesar: ' . $e->getMessage()]);
        }
    }

    public function store(Request $request, PlaylistService $playlistService)
    {
        $request->validate([
            'playlist_name' => 'required|string|max:100',
        ]);

        $recs = session('playlistData');
        if (empty($recs) || empty($recs['tracks'])) {
            return back()->withErrors(['message' => 'No se encontraron datos de recomendación.']);
        }

        try {
            $playlistName = $request->input('playlist_name');
            $createdPlaylist = $playlistService->createPlaylistFromRecommendation($playlistName, $recs);

            session()->forget('playlistData');
            $createdPlaylist->load('tracks');

            Log::info('Playlist creada con éxito:', [
                'playlist_id' => $createdPlaylist->id,
                'user_id' => Auth::id()
            ]);

            return redirect()
                ->route('emotion.playlists.show', $createdPlaylist->id)
                ->with('success', 'Playlist guardada correctamente.');

        } catch (Throwable $e) {
            Log::error('Error guardando la playlist:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->withErrors(['message' => 'Ocurrió un error inesperado al guardar tu playlist.']);
        }
    }


   public function show($id)
    {
        try {
            $playlist = Playlist::with('tracks')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            return Inertia::render('PlaylistShow', [
                'playlist' => $playlist
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Mostrar tu componente Error personalizado
            return Inertia::render('Error', [
                'status' => 404,
                'title' => 'Playlist No Encontrada',
                'message' => 'La playlist que buscas no existe o no tienes permisos para verla.',
            ]);
        }
    }
}
