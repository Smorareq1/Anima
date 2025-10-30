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
        // DEBUG: Log todo lo que entra
        Log::emergency('=== UPLOAD STARTED ===');
        Log::emergency('Request data:', $request->all());
        Log::emergency('Has photo:', [$request->hasFile('photo')]);
        Log::emergency('Headers:', $request->headers->all());

        try {
            Log::emergency('Starting validation');

            $request->validate([
                'photo' => 'required|image|mimes:jpg,jpeg,png|max:10240', // 10 MB
                'limit' => 'nullable|integer|min:1|max:50',
                'create_playlist' => 'nullable|boolean',
            ]);

            Log::emergency('Validation passed');

            $limit  = (int) $request->input('limit', 12);
            $create = (bool) $request->input('create_playlist', false);

            // 1) Guardar imagen en disco local (no public)
            Log::emergency('Attempting to store photo');
            Log::emergency('Storage path:', [Storage::disk('local')->path('')]);

            $path = $request->file('photo')->store('emotions', 'local');

            Log::emergency('Photo stored', ['path' => $path, 'success' => (bool)$path]);

            if (!$path) {
                Log::emergency('Failed to store photo - path is empty');
                if ($request->header('X-Inertia')) {
                    return redirect()->back()->withErrors(['photo' => 'Error al guardar imagen'])->withInput();
                }
                return response()->json(['error' => 'Error al guardar imagen'], 500);
            }

            // 2) Detectar emociones - usar disco local
            $fullPath = Storage::disk('local')->path($path);
            $fileExists = file_exists($fullPath);
            $fileSize = $fileExists ? filesize($fullPath) : 0;

            Log::emergency('File info:', [
                'path' => $fullPath,
                'exists' => $fileExists,
                'size' => $fileSize,
                'readable' => is_readable($fullPath)
            ]);

            Log::emergency('Calling Rekognition detectEmotion');

            $emotions = $rekognition->detectEmotion($fullPath, 3);

            Log::emergency('Rekognition response:', ['emotions' => $emotions]);

            if (empty($emotions)) {
                Log::emergency('No emotions detected - deleting file');
                Storage::disk('local')->delete($path);

                if ($request->header('X-Inertia')) {
                    return redirect()->back()->withErrors(['photo' => 'No se detectaron emociones en la imagen'])->withInput();
                }
                return response()->json(['error' => 'No se detectaron emociones en la imagen'], 400);
            }

            Log::emergency('Emotions detected successfully', ['count' => count($emotions)]);

            //Recomendaciones
            Log::emergency('Calling Spotify recommendByEmotionsEnhanced');

            $recs = $spotify->recommendByEmotionsEnhanced(Auth::user(), $emotions, $limit);

            Log::emergency('Spotify recommendations received', [
                'tracks_count' => count($recs['tracks'] ?? []),
                'emotion' => $recs['emotion'] ?? null
            ]);

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

            // Guardar en sesión flash y redirigir
            Log::emergency('Saving to session and redirecting');
            $request->session()->put('playlistData', $payload);

            Log::emergency('=== UPLOAD COMPLETED SUCCESSFULLY ===');

            return Inertia::location(route('emotion.playlists.temp'));

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::emergency('VALIDATION EXCEPTION:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            throw $e; // Re-throw para que Laravel lo maneje

        } catch (\Throwable $e) {
            Log::emergency('=== EXCEPTION CAUGHT ===');
            Log::emergency('Exception class:', [get_class($e)]);
            Log::emergency('Exception message:', [$e->getMessage()]);
            Log::emergency('Exception file:', [$e->getFile()]);
            Log::emergency('Exception line:', [$e->getLine()]);
            Log::emergency('Exception trace:', [$e->getTraceAsString()]);
            Log::emergency('Emotions variable:', ['emotions' => $emotions ?? 'NOT SET']);

            return redirect()->back()->withErrors([
                'photo' => 'Error al procesar la solicitud: ' . $e->getMessage()
            ]);

        } finally {
            // Limpiar imagen temporal
            Log::emergency('Finally block - cleaning up');
            if (isset($path)) {
                Log::emergency('Deleting temporary file:', ['path' => $path]);
                Storage::disk('local')->delete($path);
            }
            Log::emergency('=== UPLOAD PROCESS ENDED ===');
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
