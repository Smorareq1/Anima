<?php
// app/Services/Spotify/SpotifyService.php

namespace App\Services\Spotify;

use App\Models\User;
use App\Models\ConnectedAccount;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use InvalidArgumentException;
use Laravel\Socialite\Facades\Socialite;

class SpotifyService
{
    private Client $api;
    private Client $accounts;

    public function __construct()
    {
        $this->api = new Client([
            'base_uri' => rtrim((string) config('services.spotify.base_uri'), '/') . '/',
            'timeout'  => 10,
        ]);

        $this->accounts = new Client([
            'base_uri' => rtrim((string) config('services.spotify.accounts_uri'), '/') . '/',
            'timeout'  => 10,
        ]);
    }

    public function handleCallback(): User
    {
        try {
            $spotifyUser = Socialite::driver('spotify')->user();
        } catch (\Exception $e) {
            Log::error('Spotify OAuth callback failed', ['error' => $e->getMessage()]);
            throw new \RuntimeException('Error al conectar con Spotify: ' . $e->getMessage());
        }

        $mode = session()->pull('spotify.mode', Auth::check() ? 'link' : 'login');

        return DB::transaction(function () use ($spotifyUser, $mode) {
            $existing = ConnectedAccount::where('provider', 'spotify')
                ->where('provider_id', $spotifyUser->getId())
                ->first();

            if ($mode === 'link' && Auth::check()) {
                $user = Auth::user();
            } elseif ($existing && $existing->user) {
                $user = $existing->user;
            } else {
                $email    = $spotifyUser->getEmail();
                $username = $spotifyUser->getName() ?: 'Spotify User';
                $avatar   = $spotifyUser->getAvatar();
                $pwd      = bcrypt(Str::random(40));

                $user = User::firstOrCreate(
                    ['email' => $email ?? 'spotify_'.$spotifyUser->getId().'@example.invalid'],
                    [
                        'username'   => $username,
                        'first_name' => null,
                        'last_name'  => null,
                        'password'   => $pwd,
                        'avatar'     => $avatar,
                    ]
                );

                if (empty($user->avatar) && $avatar) {
                    $user->avatar = $avatar;
                    $user->save();
                }
            }

            $connected = $existing ?: new ConnectedAccount([
                'provider'    => 'spotify',
                'provider_id' => $spotifyUser->getId(),
            ]);

            $connected->token         = $spotifyUser->token ?? null;
            $connected->refresh_token = $spotifyUser->refreshToken ?? null;
            $connected->expires_at    = !empty($spotifyUser->expiresIn)
                ? now()->addSeconds((int) $spotifyUser->expiresIn)
                : null;

            $connected->user()->associate($user);
            $connected->save();

            return $user;
        });
    }

    /** Obtiene la cuenta conectada de Spotify para el usuario (si existe). */
    private function connectionFor(User $user): ?ConnectedAccount
    {
        return ConnectedAccount::where('provider', 'spotify')
            ->where('user_id', $user->id)
            ->first();
    }
    private function ensureUserToken(?ConnectedAccount $conn): ?string
    {
        if (!$conn || !$conn->token) {
            return null;
        }

        // Token con 5 minutos de margen
        if ($conn->expires_at && Carbon::parse($conn->expires_at)->subMinutes(5)->isFuture()) {
            return $conn->token;
        }

        if (!$conn->refresh_token) {
            Log::warning('No refresh token available for user', ['user_id' => $conn->user_id]);
            return $conn->token;
        }

        $lockKey = "spotify:refresh:{$conn->id}";

        return Cache::lock($lockKey, 10)->get(function () use ($conn) {
            $conn->refresh();
            if ($conn->expires_at && Carbon::parse($conn->expires_at)->subMinutes(5)->isFuture()) {
                return $conn->token;
            }

            try {
                $resp = $this->accounts->post('token', [
                    'form_params' => [
                        'grant_type'    => 'refresh_token',
                        'refresh_token' => $conn->refresh_token,
                    ],
                    'headers' => [
                        'Authorization' => 'Basic ' . base64_encode(
                                config('services.spotify.client_id') . ':' . config('services.spotify.client_secret')
                            ),
                    ],
                ]);

                $data = json_decode((string) $resp->getBody(), true);

                $conn->token = $data['access_token'] ?? $conn->token;
                if (!empty($data['expires_in'])) {
                    $conn->expires_at = now()->addSeconds((int) $data['expires_in']);
                }
                if (!empty($data['refresh_token'])) {
                    $conn->refresh_token = $data['refresh_token'];
                }
                $conn->save();

                return $conn->token;

            } catch (RequestException $e) {
                Log::error('Failed to refresh Spotify token', [
                    'user_id' => $conn->user_id,
                    'status'  => $e->getCode(),
                    'error'   => $e->getMessage()
                ]);
                return $conn->token; // fallback
            }
        });
    }
    private function appToken(): string
    {
        return Cache::remember('spotify:app_token', now()->addMinutes(50), function () {
            try {
                $resp = $this->accounts->post('token', [
                    'form_params' => ['grant_type' => 'client_credentials'],
                    'headers' => [
                        'Authorization' => 'Basic ' . base64_encode(
                                config('services.spotify.client_id') . ':' . config('services.spotify.client_secret')
                            ),
                    ],
                ]);
                $data = json_decode((string) $resp->getBody(), true);

                if (empty($data['access_token'])) {
                    throw new \RuntimeException('No access token received from Spotify');
                }

                return $data['access_token'];

            } catch (RequestException $e) {
                Log::error('Failed to get Spotify app token', [
                    'status' => $e->getCode(),
                    'error'  => $e->getMessage()
                ]);
                throw new \RuntimeException('Error al obtener token de aplicación de Spotify');
            }
        });
    }

    /** Wrapper GET hacia la API de Spotify con manejo de errores. */
    private function apiGet(string $path, string $token, array $query = []): array
    {
        try {
            $res = $this->api->get(ltrim($path, '/'), [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'query'   => $query,
            ]);
            return json_decode((string) $res->getBody(), true) ?? [];

        } catch (RequestException $e) {
            Log::error("Spotify API GET error: {$path}", [
                'status'  => $e->getCode(),
                'message' => $e->getMessage(),
                'query'   => $query
            ]);

            if ($e->getCode() === 401) {
                throw new \RuntimeException('Token de Spotify expirado o inválido');
            }

            throw new \RuntimeException('Error al comunicarse con Spotify API: ' . $e->getMessage());
        }
    }
    /** Wrapper POST hacia la API de Spotify con manejo de errores. */
    private function apiPost(string $path, string $token, array $json = []): array
    {
        try {
            $res = $this->api->post(ltrim($path, '/'), [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                    'Content-Type'  => 'application/json',
                ],
                'json' => $json,
            ]);
            return json_decode((string) $res->getBody(), true) ?? [];

        } catch (RequestException $e) {
            Log::error("Spotify API POST error: {$path}", [
                'status'  => $e->getCode(),
                'message' => $e->getMessage(),
                'body'    => $json
            ]);

            if ($e->getCode() === 401) {
                throw new \RuntimeException('Token de Spotify expirado o inválido');
            }

            throw new \RuntimeException('Error al comunicarse con Spotify API: ' . $e->getMessage());
        }
    }

    /**
     * *** Método principal MEJORADO con multi-emoción ***
     * - Usa top-3 emociones ponderadas por confidence.
     * - Cachea por firma (emociones + market).
     * - Híbrido (categorías+search+top) con reparto por pesos.
     * - Audio features scoring multi-emoción.
     * - Diversificación y normalización.
     */
    public function recommendByEmotionsEnhanced(?User $user, array $emotions, int $limit = 12): array
    {
        if (empty($emotions)) {
            throw new InvalidArgumentException('Se requiere al menos una emoción');
        }

        $connected = $user ? $this->connectionFor($user) : null;
        $userToken = $this->ensureUserToken($connected);
        $token     = $userToken ?: $this->appToken();

        // Puedes usar 'from_token' si hay userToken para que Spotify adapte país real del usuario
        $market    = config('services.spotify.default_market', 'US');

        // 1) Seleccionar top-3 emociones y normalizar pesos
        $topEmotions     = $this->pickTopEmotions($emotions, 3);
        $dominantEmotion = $topEmotions[0]['type'] ?? 'HAPPY';

        // 2) Cache por firma (emociones + market)
        $signature = $this->emotionSignature($topEmotions, $market);
        $cachedPool = $this->getCachedEmotionPoolBySignature($signature);

        if ($cachedPool && count($cachedPool) >= $limit) {
            Log::info('Using cached pool for signature: ' . $signature);
            shuffle($cachedPool);
            $tracks = array_slice($cachedPool, 0, $limit);
            $method = 'cached';
        } else {
            // 3) Híbrido multi-emoción (categorías + search + top)
            $budget = $limit * 3; // generar más y luego filtrar/ordenar
            $all = [];

            // 40% categorías ponderadas por pesos por emoción
            $catLimit = (int) floor($budget * 0.4);
            $all = array_merge($all, $this->getTracksFromCategoriesMulti($token, $topEmotions, $market, $catLimit));

            // 40% búsqueda compuesta
            $searchLimit = (int) floor($budget * 0.4);
            $all = array_merge($all, $this->getTracksFromSearchMulti($token, $topEmotions, $market, $searchLimit));

            // 20% top (neutral)
            $topLimit = max(1, $budget - $catLimit - $searchLimit);
            $all = array_merge($all, $this->getTopTracks($token, $dominantEmotion, $market, $topLimit));

            // Dedupe por track id
            $seen = [];
            $unique = [];
            foreach ($all as $t) {
                $id = $t['id'] ?? null;
                if ($id && !isset($seen[$id])) {
                    $unique[] = $t;
                    $seen[$id] = true;
                }
            }

            // 4) Audio features: score multi-emoción (promedio ponderado de coincidencias)
            $ranked = $this->filterByAudioFeaturesMulti($unique, $topEmotions, $token);

            // 5) Scoring multicriterio adicional (usamos la dominante para pesos prácticos)
            $ranked = $this->applyMultiCriteriaScoring($ranked, $dominantEmotion);

            // 6) Cachear pool por firma
            $this->cacheEmotionPoolBySignature($signature, $ranked);

            $tracks = $ranked;
            $method = 'hybrid';
        }

        // 7) Diversificación artistas y corte al límite
        $tracks = $this->diversifyTracks($tracks, $limit);
        $final  = array_slice($tracks, 0, $limit);

        // 8) Historial (si existe tabla)
        if ($user) {
            $this->saveUserEmotionHistory($user, $emotions, $final);
        }

        return [
            'emotion'          => $dominantEmotion,
            'confidence'       => $topEmotions[0]['confidence'] ?? 0,
            'emotions_used'    => $topEmotions, // [{type, confidence, weight}]
            'tracks'           => $this->formatTracks($final),
            'method'           => $method,
            'used_user_token'  => (bool) $userToken,
            'market'           => $market,
        ];
    }

    /* =========================
     *   Multi-emoción helpers
     * ========================= */

    private function pickTopEmotions(array $emotions, int $k = 3): array
    {
        $norm = array_map(function ($e) {
            return [
                'type'       => strtoupper($e['type'] ?? 'HAPPY'),
                'confidence' => (float) ($e['confidence'] ?? 0),
            ];
        }, $emotions);

        usort($norm, fn($a, $b) => $b['confidence'] <=> $a['confidence']);
        $top = array_slice($norm, 0, $k);

        $sum = array_sum(array_column($top, 'confidence')) ?: 1.0;
        foreach ($top as &$t) {
            $t['weight'] = ($t['confidence'] > 0) ? ($t['confidence'] / $sum) : (1.0 / max(1, count($top)));
        }
        return $top;
    }
    private function emotionSignature(array $topEmotions, string $market): string
    {
        $parts = array_map(fn($e) => strtoupper($e['type']), $topEmotions);
        sort($parts);
        return implode('-', $parts) . ':' . strtoupper($market);
    }
    private function getCompositeSearchTerms(array $topEmotions, int $maxTerms): array
    {
        $lists = [];
        foreach ($topEmotions as $e) {
            $terms = $this->getEnhancedSearchTerms($e['type']);
            $lists[] = array_values($terms);
        }

        $out = [];
        for ($i = 0; $i < $maxTerms; $i++) {
            foreach ($lists as $list) {
                if (isset($list[$i])) $out[] = $list[$i];
            }
        }
        return array_values(array_unique($out));
    }

    /* ===============================
     *   Híbrido multi-emoción
     * =============================== */

    /** Categorías multi: reparte el budget según weights de las emociones */
    private function getTracksFromCategoriesMulti(string $token, array $topEmotions, string $market, int $limit): array
    {
        $out = [];
        $remaining = $limit;

        foreach ($topEmotions as $idx => $e) {
            $share = $e['weight'] ?? (1 / max(1, count($topEmotions)));
            $budget = ($idx === array_key_last($topEmotions))
                ? $remaining
                : max(1, (int) round($limit * $share));
            $remaining -= $budget;

            $out = array_merge($out, $this->getTracksFromCategories($token, $e['type'], $market, $budget));
        }
        return $out;
    }

    /** Search multi: usa términos compuestos (mezcla round-robin) */
    private function getTracksFromSearchMulti(string $token, array $topEmotions, string $market, int $limit): array
    {
        $terms  = $this->getCompositeSearchTerms($topEmotions, 12);
        $tracks = [];

        foreach ($terms as $term) {
            if (count($tracks) >= $limit) break;

            try {
                $response = $this->apiGet('search', $token, [
                    'q'      => $term,
                    'type'   => 'track',
                    'market' => $market,
                    'limit'  => 20,
                    'offset' => random_int(0, 100),
                ]);

                $items = $response['tracks']['items'] ?? [];
                foreach ($items as $t) {
                    $tracks[] = $t;
                    if (count($tracks) >= $limit) break;
                }

            } catch (\Exception $e) {
                Log::debug("Search failed for term {$term}: " . $e->getMessage());
                continue;
            }
        }

        return $tracks;
    }

    /**
     * Top tracks vía playlist “Top 50 Global” (simple y robusto).
     * (Se deja como apoyo neutro; si quieres, puedes hacer variantes por emoción).
     */
    private function getTopTracks(string $token, string $emotion, string $market, int $limit): array
    {
        try {
            $response = $this->apiGet('search', $token, [
                'q'      => 'Top 50 Global',
                'type'   => 'playlist',
                'market' => $market,
                'limit'  => 1,
            ]);

            $playlists = $response['playlists']['items'] ?? [];
            if (empty($playlists)) return [];

            $playlistId = $playlists[0]['id'];

            $tracksResponse = $this->apiGet("playlists/{$playlistId}/tracks", $token, [
                'market' => $market,
                'limit'  => $limit,
                'offset' => random_int(0, 30),
            ]);

            $tracks = [];
            foreach (($tracksResponse['items'] ?? []) as $item) {
                if (!empty($item['track'])) $tracks[] = $item['track'];
            }

            return $tracks;

        } catch (\Exception $e) {
            Log::debug('Could not get top tracks: ' . $e->getMessage());
            return [];
        }
    }

    /* ==========================================
     *   Audio features: score multi-emoción
     * ========================================== */

    /**
     * Ordena por score promedio ponderado de coincidencia a los rangos de las emociones seleccionadas.
     */
    private function filterByAudioFeaturesMulti(array $tracks, array $topEmotions, string $token): array
    {
        if (empty($tracks)) return [];

        $ids = array_values(array_filter(array_map(fn ($t) => $t['id'] ?? null, $tracks)));
        if (empty($ids)) return $tracks;

        try {
            // features por lotes de 100
            $chunks      = array_chunk($ids, 100);
            $allFeatures = [];

            foreach ($chunks as $chunk) {
                $response  = $this->apiGet('audio-features', $token, ['ids' => implode(',', $chunk)]);
                $features  = $response['audio_features'] ?? [];
                foreach ($features as $f) {
                    if ($f && isset($f['id'])) $allFeatures[$f['id']] = $f;
                }
            }

            // Precalcular rangos por emoción
            $rangesByEmotion = [];
            foreach ($topEmotions as $e) {
                $rangesByEmotion[$e['type']] = $this->getEmotionAudioRanges($e['type']);
            }

            $scored = [];
            foreach ($tracks as $t) {
                $id = $t['id'] ?? null;
                if (!$id || !isset($allFeatures[$id])) {
                    // sin features => score neutro
                    $scored[] = ['track' => $t, 'score' => 0.5];
                    continue;
                }

                $features = $allFeatures[$id];

                // promedio ponderado de score por emoción
                $weighted = 0.0;
                $wSum = 0.0;
                foreach ($topEmotions as $e) {
                    $w = (float) ($e['weight'] ?? 0);
                    $ranges = $rangesByEmotion[$e['type']] ?? null;
                    if ($w <= 0 || !$ranges) continue;

                    $s = $this->calculateEmotionMatchScore($features, $ranges);
                    $weighted += $w * $s;
                    $wSum += $w;
                }
                $finalScore = ($wSum > 0) ? ($weighted / $wSum) : 0.5;

                $scored[] = ['track' => $t, 'score' => $finalScore, 'features' => $features];
            }

            usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);
            return array_map(fn($x) => $x['track'], $scored);

        } catch (\Exception $e) {
            Log::warning('Could not get audio features: ' . $e->getMessage());
            return $tracks;
        }
    }

    /**
     * Rangos ideales de audio features por emoción.
     */
    private function getEmotionAudioRanges(string $emotion): array
    {
        return match (strtoupper($emotion)) {
            'HAPPY' => [
                'valence'      => ['min' => 0.6, 'max' => 1.0, 'weight' => 3],
                'energy'       => ['min' => 0.5, 'max' => 1.0, 'weight' => 2],
                'danceability' => ['min' => 0.5, 'max' => 1.0, 'weight' => 2],
                'tempo'        => ['min' => 120, 'max' => 180, 'weight' => 1],
            ],
            'SAD' => [
                'valence'      => ['min' => 0.0, 'max' => 0.4, 'weight' => 3],
                'energy'       => ['min' => 0.0, 'max' => 0.5, 'weight' => 2],
                'acousticness' => ['min' => 0.3, 'max' => 1.0, 'weight' => 2],
                'tempo'        => ['min' => 60,  'max' => 110, 'weight' => 1],
            ],
            'CALM' => [
                'valence'      => ['min' => 0.3, 'max' => 0.7, 'weight' => 2],
                'energy'       => ['min' => 0.0, 'max' => 0.4, 'weight' => 3],
                'acousticness' => ['min' => 0.3, 'max' => 1.0, 'weight' => 2],
                'tempo'        => ['min' => 60,  'max' => 100, 'weight' => 1],
            ],
            'ANGRY' => [
                'valence'  => ['min' => 0.0, 'max' => 0.5, 'weight' => 2],
                'energy'   => ['min' => 0.7, 'max' => 1.0, 'weight' => 3],
                'loudness' => ['min' => -10, 'max' => 0,  'weight' => 2],
                'tempo'    => ['min' => 130, 'max' => 200, 'weight' => 1],
            ],
            'SURPRISED' => [
                'valence'      => ['min' => 0.5, 'max' => 0.9, 'weight' => 2],
                'energy'       => ['min' => 0.6, 'max' => 1.0, 'weight' => 3],
                'danceability' => ['min' => 0.5, 'max' => 1.0, 'weight' => 1],
            ],
            default => [
                'valence' => ['min' => 0.4, 'max' => 0.7, 'weight' => 1],
                'energy'  => ['min' => 0.4, 'max' => 0.7, 'weight' => 1],
            ],
        };
    }

    /**
     * Score de coincidencia (0..1) según qué tan dentro del rango está cada feature.
     */
    private function calculateEmotionMatchScore(array $features, array $ranges): float
    {
        $totalScore  = 0;
        $totalWeight = 0;

        foreach ($ranges as $feature => $range) {
            if (!isset($features[$feature])) continue;

            $value  = $features[$feature];
            $min    = $range['min'];
            $max    = $range['max'];
            $weight = $range['weight'] ?? 1;

            if ($value >= $min && $value <= $max) {
                $score = 1.0;
            } elseif ($value < $min) {
                $distance = $min - $value;
                $score    = max(0, 1 - ($distance * 2));
            } else {
                $distance = $value - $max;
                $score    = max(0, 1 - ($distance * 2));
            }

            $totalScore  += $score * $weight;
            $totalWeight += $weight;
        }

        return $totalWeight > 0 ? $totalScore / $totalWeight : 0.5;
    }

    /**
     * Scoring multicriterio adicional: popularidad, recencia, preview_url y explícito.
     * Se sigue ponderando con la emoción dominante (simple y efectivo).
     */
    private function applyMultiCriteriaScoring(array $tracks, string $emotion): array
    {
        $nowYear = (int) date('Y');

        $scored = array_map(function ($t) use ($emotion, $nowYear) {
            $pop        = (int) ($t['popularity'] ?? 50);      // 0..100
            $year       = $this->extractReleaseYear($t);       // o null
            $hasPreview = !empty($t['preview_url']);
            $explicit   = (bool) ($t['explicit'] ?? false);

            // Recency: 1 si <=2 años, luego decae
            $recency = 0.5;
            if ($year) {
                $age = max(0, $nowYear - $year);
                if     ($age <= 2)  $recency = 1.0;
                elseif ($age <= 5)  $recency = 0.8;
                elseif ($age <= 10) $recency = 0.6;
                else                $recency = 0.3;
            }

            $popWeight     = match (strtoupper($emotion)) {
                'CALM' => 0.15, 'SAD' => 0.20, default => 0.30
            };
            $recencyWeight = match (strtoupper($emotion)) {
                'SAD', 'CALM' => 0.20, default => 0.25
            };
            $previewWeight = 0.10;
            $explicitPenalty = 0.10;

            $score = 0.0;
            $score += $popWeight     * ($pop / 100.0);
            $score += $recencyWeight * $recency;
            if ($hasPreview) $score += $previewWeight;
            if ($explicit)   $score -= $explicitPenalty;

            return ['t' => $t, 's' => max(0.0, min(1.0, $score))];
        }, $tracks);

        usort($scored, fn ($a, $b) => $b['s'] <=> $a['s']);
        return array_map(fn ($x) => $x['t'], $scored);
    }

    private function extractReleaseYear(array $t): ?int
    {
        $date = $t['album']['release_date'] ?? null;
        if (!$date) return null;
        $y = (int) substr($date, 0, 4); // YYYY, YYYY-MM, YYYY-MM-DD
        return $y > 1900 ? $y : null;
    }

    /**
     * Diversificación: dedupe por track y limitar repetición de artista.
     */
    private function diversifyTracks(array $tracks, int $limit): array
    {
        // Dedupe por id
        $byId = [];
        foreach ($tracks as $t) {
            $id = $t['id'] ?? null;
            if ($id && !isset($byId[$id])) $byId[$id] = $t;
        }
        $tracks = array_values($byId);

        $picked     = [];
        $usedArtist = [];

        // 1ª pasada: máximo 1 por artista
        foreach ($tracks as $t) {
            if (count($picked) >= $limit) break;
            $artists = $t['artists'] ?? [];
            $aId     = $artists[0]['id'] ?? ($artists[0]['name'] ?? null);
            if (!$aId) continue;
            if (isset($usedArtist[$aId])) continue;
            $usedArtist[$aId] = 1;
            $picked[] = $t;
        }

        // 2ª pasada: completa hasta el límite con lo que falte
        if (count($picked) < $limit) {
            foreach ($tracks as $t) {
                if (count($picked) >= $limit) break;
                $id = $t['id'] ?? null;
                if (!$id) continue;
                $exists = false;
                foreach ($picked as $p) {
                    if (($p['id'] ?? null) === $id) { $exists = true; break; }
                }
                if (!$exists) $picked[] = $t;
            }
        }

        return $picked;
    }

    /* ======================
     *   Cache por firma
     * ====================== */

    private function getCachedEmotionPoolBySignature(string $signature): ?array
    {
        $key  = "spotify:emotion_pool:" . $signature;
        $pool = Cache::get($key);
        return is_array($pool) ? $pool : null;
    }

    private function cacheEmotionPoolBySignature(string $signature, array $tracks, int $ttlMinutes = 180): void
    {
        $unique = [];
        $seen   = [];
        foreach ($tracks as $t) {
            $id = $t['id'] ?? null;
            if ($id && !isset($seen[$id])) {
                $unique[]  = $t;
                $seen[$id] = true;
                if (count($unique) >= 300) break;
            }
        }
        $key = "spotify:emotion_pool:" . $signature;
        Cache::put($key, $unique, now()->addMinutes($ttlMinutes));
    }

    /* ==============================
     *   Utilidades ya existentes
     * ============================== */

    /**
     * Tracks desde categorías relevantes (elige playlists al azar dentro de cada categoría).
     */
    private function getTracksFromCategories(string $token, string $emotion, string $market, int $limit): array
    {
        $categoryMap = [
            'HAPPY'     => ['party', 'pop', 'dance', 'latin', 'summer'],
            'SAD'       => ['chill', 'indie', 'acoustic', 'rainy_day', 'soul'],
            'CALM'      => ['focus', 'sleep', 'wellness', 'jazz', 'classical'],
            'ANGRY'     => ['workout', 'rock', 'metal', 'hiphop', 'edm'],
            'SURPRISED' => ['pop', 'trending', 'viral', 'dance', 'party'],
            'CONFUSED'  => ['alternative', 'indie', 'chill', 'focus'],
            'DISGUSTED' => ['rock', 'metal', 'punk', 'alternative'],
            'FEAR'      => ['soundtrack', 'classical', 'ambient', 'chill'],
        ];

        $categories = $categoryMap[strtoupper($emotion)] ?? $categoryMap['HAPPY'];
        $tracks     = [];

        foreach ($categories as $categoryId) {
            if (count($tracks) >= $limit) break;

            try {
                $response = $this->apiGet("browse/categories/{$categoryId}/playlists", $token, [
                    'country' => $market,
                    'limit'   => 5,
                ]);

                $playlists = $response['playlists']['items'] ?? [];
                if (empty($playlists)) continue;

                $playlist = $playlists[array_rand($playlists)];

                $tracksResponse = $this->apiGet("playlists/{$playlist['id']}/tracks", $token, [
                    'market' => $market,
                    'limit'  => 20,
                    'offset' => random_int(0, 50),
                ]);

                $items = $tracksResponse['items'] ?? [];
                foreach ($items as $item) {
                    if (!empty($item['track'])) {
                        $tracks[] = $item['track'];
                        if (count($tracks) >= $limit) break;
                    }
                }

            } catch (\Exception $e) {
                Log::debug("Could not get category {$categoryId}: " . $e->getMessage());
                continue;
            }
        }

        return $tracks;
    }

    /**
     * Términos de búsqueda mejorados para Search API.
     */
    private function getEnhancedSearchTerms(string $emotion): array
    {
        $emotion = strtoupper($emotion);
        $map = [
            'HAPPY'     => ['happy', 'feel good', 'party', 'dance', 'summer', 'latin pop'],
            'SAD'       => ['sad', 'melancholy', 'acoustic ballad', 'heartbreak', 'piano'],
            'CALM'      => ['chill', 'lofi', 'relaxing', 'peaceful', 'ambient', 'jazz'],
            'ANGRY'     => ['hard rock', 'metal', 'punk', 'aggressive', 'intense'],
            'SURPRISED' => ['energetic', 'edm', 'house', 'uplifting', 'trending'],
            'CONFUSED'  => ['indie', 'alternative', 'trip hop', 'electronic'],
            'DISGUSTED' => ['grunge', 'industrial', 'alternative metal'],
            'FEAR'      => ['dark ambient', 'goth', 'emo'],
        ];

        $terms = $map[$emotion] ?? ['popular', 'trending', 'pop', 'rock'];
        shuffle($terms);
        return $terms;
    }

    /**
     * Guarda historial mínimo (si existe la tabla emotion_histories). No bloquea.
     */
    private function saveUserEmotionHistory(User $user, array $emotions, array $tracks): void
    {
        try {
            if (!Schema::hasTable('emotion_histories')) {
                Log::info('Historial no guardado (tabla emotion_histories no existe).');
                return;
            }

            DB::table('emotion_histories')->insert([
                'user_id'        => $user->id,
                'main_emotion'   => strtoupper($emotions[0]['type'] ?? 'UNKNOWN'),
                'confidence'     => $emotions[0]['confidence'] ?? 0,
                'top_track_id'   => $tracks[0]['id'] ?? null,
                'top_track_name' => $tracks[0]['name'] ?? null,
                'payload'        => json_encode([
                    'emotions'  => $emotions,
                    'track_ids' => array_values(array_filter(array_map(fn ($t) => $t['id'] ?? null, $tracks))),
                ]),
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

        } catch (\Throwable $e) {
            Log::warning('No se pudo guardar historial de emoción: ' . $e->getMessage());
        }
    }

    /**
     * Normaliza tracks para respuesta compacta.
     */
    private function formatTracks(array $tracks): array
    {
        return array_map(function ($t) {
            $images = $t['album']['images'] ?? [];
            $image  = $images[1]['url'] ?? ($images[0]['url'] ?? null);

            return [
                'id'           => $t['id'] ?? null,
                'uri'          => $t['uri'] ?? null,
                'name'         => $t['name'] ?? 'Unknown',
                'artist'       => $t['artists'][0]['name'] ?? 'Unknown Artist',
                'album'        => $t['album']['name'] ?? 'Unknown Album',
                'url'          => $t['external_urls']['spotify'] ?? null,
                'image'        => $image,
                'preview_url'  => $t['preview_url'] ?? null,
                'popularity'   => $t['popularity'] ?? 0,
                'explicit'     => $t['explicit'] ?? false,
                'release_date' => $t['album']['release_date'] ?? null,
            ];
        }, $tracks);
    }

    /**
     * Crea playlist en la cuenta del usuario y añade URIs.
     */
    public function createPlaylistFor(User $user, string $name, array $trackUris, bool $public = false): ?array
    {
        if (empty($trackUris)) {
            throw new \InvalidArgumentException('Se requiere al menos un track para crear la playlist');
        }

        $connected = $this->connectionFor($user);
        $token     = $this->ensureUserToken($connected);

        if (!$token) {
            Log::warning('Cannot create playlist: user not connected to Spotify', ['user_id' => $user->id]);
            return null;
        }

        try {
            $me = $this->apiGet('me', $token);
            if (empty($me['id'])) {
                throw new \RuntimeException('No se pudo obtener el ID del usuario de Spotify');
            }

            $playlist = $this->apiPost("users/{$me['id']}/playlists", $token, [
                'name'        => $name,
                'public'      => $public,
                'description' => 'Generada por análisis de emociones',
            ]);

            foreach (array_chunk($trackUris, 100) as $chunk) {
                $this->apiPost("playlists/{$playlist['id']}/tracks", $token, ['uris' => $chunk]);
            }

            return $playlist;

        } catch (\Exception $e) {
            Log::error('Failed to create Spotify playlist', [
                'user_id' => $user->id,
                'error'   => $e->getMessage()
            ]);
            throw new \RuntimeException('Error al crear la playlist en Spotify: ' . $e->getMessage());
        }
    }

    /**
     * (Opcional) Pruebas rápidas de conectividad/API para diagnóstico.
     */
    public function testSpotifyAPI(?User $user = null): array
    {
        $connected = $user ? $this->connectionFor($user) : null;
        $userToken = $this->ensureUserToken($connected);
        $token     = $userToken ?: $this->appToken();

        $results = [];

        // Test categorías
        try {
            $data = $this->apiGet('browse/categories', $token, ['limit' => 1]);
            $results['categories_test'] = [
                'success'  => true,
                'has_data' => !empty($data['categories'])
            ];
        } catch (\Exception $e) {
            $results['categories_test'] = ['success' => false, 'error' => $e->getMessage()];
        }

        // Test géneros disponibles (con fallback interno si falla)
        try {
            $genres = $this->availableGenreSeeds($token);
            $results['genres_test'] = [
                'success'       => true,
                'genres_count'  => count($genres),
                'sample_genres' => array_slice($genres, 0, 10),
            ];
        } catch (\Exception $e) {
            $results['genres_test'] = ['success' => false, 'error' => $e->getMessage()];
        }

        // Recommendations mínimas
        try {
            $data = $this->apiGet('recommendations', $token, [
                'seed_genres' => 'pop',
                'limit'       => 5
            ]);
            $results['recommendations_minimal'] = [
                'success'      => true,
                'tracks_count' => count($data['tracks'] ?? [])
            ];
        } catch (\Exception $e) {
            $results['recommendations_minimal'] = [
                'success'       => false,
                'error'         => $e->getMessage(),
                'url_attempted' => 'recommendations?seed_genres=pop&limit=5'
            ];
        }

        $results['token_info'] = [
            'using_user_token' => (bool) $userToken,
            'token_length'     => strlen($token),
            'token_prefix'     => substr($token, 0, 10) . '...'
        ];

        $results['config'] = [
            'base_uri' => config('services.spotify.base_uri'),
            'market'   => config('services.spotify.default_market')
        ];

        return $results;
    }

    /**
     * Semillas de género (cacheadas) con fallback local si falla la API.
     */
    private function availableGenreSeeds(string $token): array
    {
        return Cache::remember('spotify:available_genres', now()->addDays(7), function () use ($token) {
            try {
                $data = $this->apiGet('recommendations/available-genre-seeds', $token);
                $genres = $data['genres'] ?? [];
                if (empty($genres)) return $this->getFallbackGenres();
                return $genres;
            } catch (\Exception $e) {
                Log::warning('Failed to fetch Spotify genres, using fallback list', ['error' => $e->getMessage()]);
                return $this->getFallbackGenres();
            }
        });
    }

    /** Lista local de géneros por si el endpoint falla. */
    private function getFallbackGenres(): array
    {
        return [
            'acoustic','afrobeat','alt-rock','alternative','ambient','anime','black-metal','bluegrass','blues',
            'bossanova','brazil','breakbeat','british','cantopop','chicago-house','children','chill','classical',
            'club','comedy','country','dance','dancehall','death-metal','deep-house','detroit-techno','disco',
            'disney','drum-and-bass','dub','dubstep','edm','electro','electronic','emo','folk','forro','french',
            'funk','garage','german','gospel','goth','grindcore','groove','grunge','guitar','happy','hard-rock',
            'hardcore','hardstyle','heavy-metal','hip-hop','holidays','honky-tonk','house','idm','indian','indie',
            'indie-pop','industrial','iranian','j-dance','j-idol','j-pop','j-rock','jazz','k-pop','kids','latin',
            'latino','malay','mandopop','metal','metal-misc','metalcore','minimal-techno','movies','mpb','new-age',
            'new-release','opera','pagode','party','philippines-opm','piano','pop','pop-film','post-dubstep',
            'power-pop','progressive-house','psych-rock','punk','punk-rock','r-n-b','rainy-day','reggae','reggaeton',
            'road-trip','rock','rock-n-roll','rockabilly','romance','sad','salsa','samba','sertanejo','show-tunes',
            'singer-songwriter','ska','sleep','songwriter','soul','soundtracks','spanish','study','summer','swedish',
            'synth-pop','tango','techno','trance','trip-hop','turkish','work-out','world-music'
        ];
    }
}
