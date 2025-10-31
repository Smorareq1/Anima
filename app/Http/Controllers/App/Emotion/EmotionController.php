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
        try {
            $request->validate([
                'photo' => 'required|image|mimes:jpg,jpeg,png|max:10240',
                'limit' => 'nullable|integer|min:1|max:50',
                'create_playlist' => 'nullable|boolean',
            ]);

            // Al inicio del método, para ver qué llega
            Log::info('Request data', $request->all());
            dd([
                'env' => app()->environment(),
                'redis_scheme' => env('REDIS_SCHEME'),
                'redis_host' => env('REDIS_HOST'),
                'redis_port' => env('REDIS_PORT'),
                'aws_key_exists' => !empty(env('AWS_ACCESS_KEY_ID')),
                'rekognition_available' => $rekognition->isAvailable(),
            ]);

            $limit = (int) $request->input('limit', 12);
            $create = (bool) $request->input('create_playlist', false);
            // Obtener el contenido del archivo directamente
            $imageContent = file_get_contents($request->file('photo')->getRealPath());
            $emotions = $rekognition->detectEmotion($imageContent, 3);

            if (empty($emotions)) {
                if ($request->header('X-Inertia')) {
                    return redirect()->back()
                        ->withErrors(['photo' => 'No se detectaron emociones en la imagen'])
                        ->withInput();
                }
                return response()->json(['error' => 'No se detectaron emociones en la imagen'], 400);
            }

            // Recomendaciones de Spotify
            $recs = $spotify->recommendByEmotionsEnhanced(Auth::user(), $emotions, $limit);

            // Payload
            $payload = [
                'message'          => 'Análisis y recomendaciones generadas',
                'emotions'         => $emotions,
                'emotions_used'    => $recs['emotions_used'] ?? null,
                'method_used'      => $recs['method'] ?? 'hybrid',
                'emotion'          => $recs['emotion'] ?? null,
                'confidence'       => $recs['confidence'] ?? null,
                'tracks'           => $recs['tracks'] ?? [],
            ];

            $request->session()->put('playlistData', $payload);
            return Inertia::location(route('emotion.playlists.temp'));

        } catch (ValidationException $e) {
            Log::emergency('VALIDATION EXCEPTION:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            throw $e;

        } catch (\Throwable $e) {
            Log::emergency('=== EXCEPTION CAUGHT ===', [
                'class' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return redirect()->back()->withErrors([
                'photo' => 'Error al procesar la solicitud: ' . $e->getMessage()
            ]);
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
        $playlist = Playlist::with('tracks')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('PlaylistShow', [
            'playlist' => $playlist
        ]);
    }
}
