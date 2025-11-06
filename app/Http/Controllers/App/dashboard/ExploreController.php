<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Services\Spotify\SpotifyService;
use Illuminate\Support\Facades\Log;

class ExploreController extends Controller
{
    public function index(Request $request, SpotifyService $spotify)
    {
        $user = Auth::user();

        try {
            $limit = 12;

            // 🔥 1. Emociones posibles
            $possibleEmotions = ['HAPPY', 'SAD', 'CALM', 'ANGRY', 'SURPRISED', 'CONFUSED', 'DISGUSTED', 'FEAR'];

            // 🔥 2. Elegir una emoción aleatoria
            $randomEmotion = $possibleEmotions[array_rand($possibleEmotions)];
            $confidence = mt_rand(60, 100) / 100; // valor aleatorio 0.6–1.0

            $emotions = [[
                'type' => $randomEmotion,
                'confidence' => $confidence,
            ]];

            Log::info("🎵 Explorador usando emoción aleatoria: {$randomEmotion} ({$confidence})");

            // 🔥 3. Obtener tracks desde Spotify usando la emoción aleatoria
            $recs = $spotify->recommendByEmotionsEnhanced($user, $emotions, $limit);

            // 🔥 4. Preparar datos de salida
            $data = [
                'playlistRecomendada' => [
                    [
                        'id' => 1,
                        'name' => 'Mood Booster',
                        'songs' => 100,
                        'emotion' => 'HAPPY',
                        'date' => '2025-01-15',
                        'image' => '/images/songs/blinding_lights.jpg',
                    ],
                    [
                        'id' => 2,
                        'name' => 'Focus Flow',
                        'songs' => 50,
                        'emotion' => 'CALM',
                        'date' => '2025-01-15',
                        'image' => '/images/songs/levitating.jpg',
                    ],
                    [
                        'id' => 3,
                        'name' => 'Lo-Fi Beats',
                        'songs' => 20,
                        'emotion' => 'CALM',
                        'date' => '2025-01-15',
                        'image' => 'https://i.ibb.co/XkXRFdd4/lo-fi.webp',
                    ],
                ],
                'cancionesRecomendadas' => $recs['tracks'] ?? [],
                'emotion_used' => $randomEmotion,
            ];

            return Inertia::render('Dashboard/Explore', [
                'explorarData' => $data,
                'user' => $user,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error en ExploreController: ' . $e->getMessage());

            // fallback con datos mock si Spotify falla
            $data = [
                'playlistRecomendada' => [
                    [
                        'id' => 1,
                        'name' => 'Mood Booster',
                        'songs' => 100,
                        'emotion' => 'HAPPY',
                        'date' => '2025-01-15',
                        'image' => '/images/songs/blinding_lights.jpg',
                    ],
                ],
                'cancionesRecomendadas' => [],
                'emotion_used' => 'NONE',
            ];

            return Inertia::render('Dashboard/Explore', [
                'explorarData' => $data,
                'user' => $user,
            ]);
        }
    }
}
