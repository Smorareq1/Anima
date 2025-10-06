<?php

namespace App\Http\Controllers\App\Emotion;

use App\Http\Controllers\Controller;
use App\Services\amazon\RekognitionService;
use App\Services\Spotify\SpotifyService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

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
            'photo' => 'required|image|mimes:jpg,jpeg,png|max:10240', // 10 MB
            'limit' => 'nullable|integer|min:1|max:50',
            'create_playlist' => 'nullable|boolean',
        ]);

        $limit = (int) $request->input('limit', 12);
        $create = (bool) $request->input('create_playlist', false);

        // 1) Guardar imagen
        $path = $request->file('photo')->store('emotions', 'public');
        if (!$path) {
            return response()->json(['error' => 'Error al guardar imagen'], 500);
        }

        try {
            // 2) Detectar emociones
            $fullPath = \Storage::disk('public')->path($path);
            $emotions = $rekognition->detectEmotion($fullPath, 3);

            if (empty($emotions)) {
                \Storage::disk('public')->delete($path);
                return response()->json(['error' => 'No se detectaron emociones en la imagen'], 400);
            }

            \Log::info('Emociones detectadas:', $emotions);

            // 3) NUEVO: usar método mejorado (con cache de pool + híbrido)
            $recs = $spotify->recommendByEmotionsEnhanced(\Auth::user(), $emotions, $limit);

            // 4) Crear playlist si se solicitó y hay token de usuario
            $playlist = null;
            if ($create && ($recs['used_user_token'] ?? false) && !empty($recs['tracks'])) {
                $uris = array_values(array_filter(array_map(fn($t) => $t['uri'] ?? null, $recs['tracks'])));
                $mainEmotion = $recs['emotion'] ?? ($emotions[0]['type'] ?? 'MIX');
                if (!empty($uris)) {
                    $playlist = $spotify->createPlaylistFor(\Auth::user(), "{$mainEmotion} Mood Mix", $uris, false);
                }
            }

            return response()->json([
                'message'          => 'Análisis y recomendaciones generadas',
                'emotions'         => $emotions,
                'method_used'      => $recs['method'] ?? 'hybrid',
                'emotion'          => $recs['emotion'] ?? null,
                'confidence'       => $recs['confidence'] ?? null,
                'tracks'           => $recs['tracks'] ?? [],
                'created_playlist' => $playlist ? [
                    'id'   => $playlist['id'],
                    'name' => $playlist['name'],
                    'url'  => $playlist['external_urls']['spotify'] ?? null,
                ] : null,
            ]);

        } catch (\Throwable $e) {
            \Log::error('Error completo en upload:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'emotions' => $emotions ?? null,
            ]);

            return response()->json([
                'error' => 'Error al procesar la solicitud: ' . $e->getMessage()
            ], 500);
        } finally {
            // Limpiar imagen temporal
            if (isset($path)) {
                \Storage::disk('public')->delete($path);
            }
        }
    }


    public function testAPI(SpotifyService $spotify)
    {
        try {
            $user = auth()->check() ? auth()->user() : null;
            $results = $spotify->testSpotifyAPI($user);

            return response()->json([
                'success' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
