<?php
// app/Services/Spotify/SpotifyService.php
namespace App\Services\Spotify;

use App\Models\User;
use App\Models\ConnectedAccount;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SpotifyService
{
    private Client $api;
    private Client $accounts;

    public function __construct()
    {
        $this->api = new Client([
            'base_uri' => config('services.spotify.base_uri'),
            'timeout' => 10,
        ]);
        $this->accounts = new Client([
            'base_uri' => config('services.spotify.accounts_uri'),
            'timeout' => 10,
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
                $email = $spotifyUser->getEmail();
                $username = $spotifyUser->getName() ?: 'Spotify User';
                $avatar = $spotifyUser->getAvatar();
                $pwd = bcrypt(Str::random(40));

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

            $connected->token = $spotifyUser->token ?? null;
            $connected->refresh_token = $spotifyUser->refreshToken ?? null;
            $connected->expires_at = !empty($spotifyUser->expiresIn)
                ? now()->addSeconds((int) $spotifyUser->expiresIn)
                : null;

            $connected->user()->associate($user);
            $connected->save();

            return $user;
        });
    }

    /** Obtiene la cuenta conectada a Spotify (si existe) */
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

        // Si el token aún es válido (con 5 min de margen)
        if ($conn->expires_at && Carbon::parse($conn->expires_at)->subMinutes(5)->isFuture()) {
            return $conn->token;
        }

        if (!$conn->refresh_token) {
            Log::warning('No refresh token available for user', ['user_id' => $conn->user_id]);
            return $conn->token;
        }

        // Lock para evitar múltiples refreshes concurrentes
        $lockKey = "spotify:refresh:{$conn->id}";

        return Cache::lock($lockKey, 10)->get(function () use ($conn) {
            // Re-verificar por si otro proceso ya actualizó el token
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

                $data = json_decode((string)$resp->getBody(), true);

                $conn->token = $data['access_token'] ?? $conn->token;
                if (!empty($data['expires_in'])) {
                    $conn->expires_at = now()->addSeconds((int)$data['expires_in']);
                }
                if (!empty($data['refresh_token'])) {
                    $conn->refresh_token = $data['refresh_token'];
                }
                $conn->save();

                return $conn->token;

            } catch (RequestException $e) {
                Log::error('Failed to refresh Spotify token', [
                    'user_id' => $conn->user_id,
                    'status' => $e->getCode(),
                    'error' => $e->getMessage()
                ]);
                return $conn->token; // Devolver el token expirado como fallback
            }
        });
    }

    private function appToken(): string
    {
        return Cache::remember('spotify:app_token', now()->addMinutes(50), function() {
            try {
                $resp = $this->accounts->post('token', [
                    'form_params' => ['grant_type' => 'client_credentials'],
                    'headers' => [
                        'Authorization' => 'Basic ' . base64_encode(
                                config('services.spotify.client_id') . ':' . config('services.spotify.client_secret')
                            ),
                    ],
                ]);
                $data = json_decode((string)$resp->getBody(), true);

                if (empty($data['access_token'])) {
                    throw new \RuntimeException('No access token received from Spotify');
                }

                return $data['access_token'];

            } catch (RequestException $e) {
                Log::error('Failed to get Spotify app token', [
                    'status' => $e->getCode(),
                    'error' => $e->getMessage()
                ]);
                throw new \RuntimeException('Error al obtener token de aplicación de Spotify');
            }
        });
    }

    private function apiGet(string $path, string $token, array $query = [])
    {
        try {
            $res = $this->api->get(ltrim($path, '/'), [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'query'   => $query,
            ]);
            return json_decode((string)$res->getBody(), true);

        } catch (RequestException $e) {
            Log::error("Spotify API GET error: {$path}", [
                'status' => $e->getCode(),
                'message' => $e->getMessage(),
                'query' => $query
            ]);

            // Si es 401, el token probablemente expiró
            if ($e->getCode() === 401) {
                throw new \RuntimeException('Token de Spotify expirado o inválido');
            }

            throw new \RuntimeException('Error al comunicarse con Spotify API: ' . $e->getMessage());
        }
    }

    private function apiPost(string $path, string $token, array $json = [])
    {
        try {
            $res = $this->api->post(ltrim($path, '/'), [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                    'Content-Type'  => 'application/json',
                ],
                'json' => $json,
            ]);
            return json_decode((string)$res->getBody(), true);

        } catch (RequestException $e) {
            Log::error("Spotify API POST error: {$path}", [
                'status' => $e->getCode(),
                'message' => $e->getMessage(),
                'body' => $json
            ]);

            if ($e->getCode() === 401) {
                throw new \RuntimeException('Token de Spotify expirado o inválido');
            }

            throw new \RuntimeException('Error al comunicarse con Spotify API: ' . $e->getMessage());
        }
    }

    private function availableGenreSeeds(string $token): array
    {
        return Cache::remember('spotify:available_genres', now()->addDays(7), function() use ($token) {
            try {
                $data = $this->apiGet('recommendations/available-genre-seeds', $token);
                return $data['genres'] ?? [];
            } catch (\Exception $e) {
                // Fallback: usar lista hardcodeada si el endpoint falla
                Log::warning('Failed to fetch Spotify genres, using fallback list', [
                    'error' => $e->getMessage()
                ]);
                return $this->getFallbackGenres();
            }
        });
    }

    private function getFallbackGenres(): array
    {
        return [
            'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient', 'anime',
            'black-metal', 'bluegrass', 'blues', 'bossanova', 'brazil', 'breakbeat',
            'british', 'cantopop', 'chicago-house', 'children', 'chill', 'classical',
            'club', 'comedy', 'country', 'dance', 'dancehall', 'death-metal', 'deep-house',
            'detroit-techno', 'disco', 'disney', 'drum-and-bass', 'dub', 'dubstep',
            'edm', 'electro', 'electronic', 'emo', 'folk', 'forro', 'french', 'funk',
            'garage', 'german', 'gospel', 'goth', 'grindcore', 'groove', 'grunge',
            'guitar', 'happy', 'hard-rock', 'hardcore', 'hardstyle', 'heavy-metal',
            'hip-hop', 'holidays', 'honky-tonk', 'house', 'idm', 'indian', 'indie',
            'indie-pop', 'industrial', 'iranian', 'j-dance', 'j-idol', 'j-pop', 'j-rock',
            'jazz', 'k-pop', 'kids', 'latin', 'latino', 'malay', 'mandopop', 'metal',
            'metal-misc', 'metalcore', 'minimal-techno', 'movies', 'mpb', 'new-age',
            'new-release', 'opera', 'pagode', 'party', 'philippines-opm', 'piano',
            'pop', 'pop-film', 'post-dubstep', 'power-pop', 'progressive-house', 'psych-rock',
            'punk', 'punk-rock', 'r-n-b', 'rainy-day', 'reggae', 'reggaeton', 'road-trip',
            'rock', 'rock-n-roll', 'rockabilly', 'romance', 'sad', 'salsa', 'samba',
            'sertanejo', 'show-tunes', 'singer-songwriter', 'ska', 'sleep', 'songwriter',
            'soul', 'soundtracks', 'spanish', 'study', 'summer', 'swedish', 'synth-pop',
            'tango', 'techno', 'trance', 'trip-hop', 'turkish', 'work-out', 'world-music'
        ];
    }

    private function genresForEmotions(array $emotions, int $max = 3): array
    {
        // DEBUG: Ver las emociones de entrada
        \Log::info('genresForEmotions - Input:', [
            'emotions' => $emotions,
            'max' => $max
        ]);

        $map = [
            'HAPPY'     => ['pop', 'dance', 'latin', 'edm', 'happy'],
            'SAD'       => ['acoustic', 'indie', 'folk', 'sad', 'piano'],
            'CALM'      => ['chill', 'ambient', 'jazz', 'study', 'sleep'],
            'ANGRY'     => ['rock', 'metal', 'punk', 'hard-rock', 'hardcore'],
            'SURPRISED' => ['electronic', 'house', 'indie-pop', 'club', 'electro'],
            'CONFUSED'  => ['alt-rock', 'indie', 'trip-hop', 'electronic', 'alternative'],
            'DISGUSTED' => ['industrial', 'grunge', 'alternative', 'metal'],
            'FEAR'      => ['goth', 'emo', 'industrial', 'metal'],
        ];

        $desired = [];
        foreach ($emotions as $e) {
            $type = strtoupper($e['type'] ?? '');

            // DEBUG: Ver qué tipo de emoción estamos procesando
            \Log::info('genresForEmotions - Processing emotion:', [
                'type' => $type,
                'has_mapping' => isset($map[$type])
            ]);

            if (isset($map[$type])) {
                $desired = array_merge($desired, $map[$type]);
            }
        }

        $desired = array_values(array_unique($desired));

        // DEBUG: Ver géneros deseados antes del filtrado
        \Log::info('genresForEmotions - Desired genres before filtering:', $desired);

        if (empty($desired)) {
            \Log::warning('genresForEmotions - No genres found for emotions, using fallback');
            $desired = ['pop', 'rock', 'indie'];
        }

        // Usar lista hardcodeada en lugar de llamar a la API
        $available = $this->getFallbackGenres();
        $filtered = array_values(array_intersect($desired, $available));

        // DEBUG: Ver géneros después del filtrado
        \Log::info('genresForEmotions - After filtering with available:', [
            'filtered' => $filtered,
            'available_count' => count($available)
        ]);

        if (empty($filtered)) {
            \Log::warning('genresForEmotions - No valid genres after filtering, using safe fallback');
            $filtered = ['pop', 'rock', 'jazz'];
        }

        shuffle($filtered);
        $result = array_slice($filtered, 0, max(1, min($max, count($filtered))));

        // DEBUG: Ver resultado final
        \Log::info('genresForEmotions - Final result:', $result);

        return $result;
    }

    private function randomFeaturesFor(string $mainEmotion): array
    {
        $r = fn($min, $max) => (float) number_format($min + lcg_value() * ($max - $min), 2);

        return match(strtoupper($mainEmotion)) {
            'HAPPY'     => [
                'target_valence' => $r(0.7, 0.95),
                'min_energy' => 0.5,
                'min_danceability' => 0.5
            ],
            'SAD'       => [
                'target_valence' => $r(0.2, 0.45),
                'max_energy' => 0.5,
                'max_tempo' => 110,
                'target_acousticness' => $r(0.5, 0.9)
            ],
            'CALM'      => [
                'target_valence' => $r(0.4, 0.7),
                'max_energy' => 0.5,
                'max_danceability' => 0.6,
                'max_tempo' => 115,
                'min_acousticness' => 0.3
            ],
            'ANGRY'     => [
                'target_valence' => $r(0.3, 0.6),
                'min_energy' => 0.7,
                'min_tempo' => 110,
                'min_loudness' => -8
            ],
            'SURPRISED' => [
                'target_valence' => $r(0.5, 0.8),
                'min_energy' => 0.6,
                'min_danceability' => 0.5
            ],
            'CONFUSED'  => [
                'target_valence' => $r(0.4, 0.6),
                'target_energy' => $r(0.4, 0.6)
            ],
            default     => [
                'target_valence' => $r(0.45, 0.7),
                'target_energy' => $r(0.4, 0.7)
            ]
        };
    }

    /**
     * Recomendaciones variadas, evitando repetidos (con intentos múltiples).
     */

    public function recommendByEmotionsAlternative(?User $user, array $emotions, int $limit = 12, string $recentKey = null): array
    {
        if (empty($emotions)) {
            throw new \InvalidArgumentException('Se requiere al menos una emoción');
        }

        $connected = $user ? $this->connectionFor($user) : null;
        $userToken = $this->ensureUserToken($connected);
        $token = $userToken ?: $this->appToken();

        $market = config('services.spotify.default_market', 'US');

        // Set de exclusión de recientes
        $recentKey = $recentKey ?: 'spotify:recent:' . ($user?->id ?? 'anon_' . session()->getId());
        $recentIds = Cache::get($recentKey, []);

        $mainEmotion = strtoupper($emotions[0]['type'] ?? 'HAPPY');

        // Mapeo de emociones a términos de búsqueda
        $searchTerms = $this->getSearchTermsForEmotion($mainEmotion);

        $collected = [];
        $seen = [];
        $attempts = 0;
        $maxAttempts = 5;

        while (count($collected) < $limit && $attempts < $maxAttempts) {
            $attempts++;

            try {
                // Usar la API de búsqueda en lugar de recommendations
                $searchQuery = $this->buildSearchQuery($searchTerms, $attempts);

                \Log::info("Spotify search attempt {$attempts}:", [
                    'query' => $searchQuery,
                    'emotion' => $mainEmotion
                ]);

                // Usar el endpoint de búsqueda que SÍ funciona
                $response = $this->apiGet('search', $token, [
                    'q' => $searchQuery,
                    'type' => 'track',
                    'market' => $market,
                    'limit' => 50,
                    'offset' => random_int(0, 100) // Para obtener resultados variados
                ]);

                $tracks = $response['tracks']['items'] ?? [];

                if (empty($tracks)) {
                    \Log::warning("No tracks returned in attempt {$attempts}");
                    continue;
                }

                // Filtrar por características de audio si es posible
                $tracks = $this->filterTracksByEmotion($tracks, $mainEmotion, $token);

                shuffle($tracks);

                foreach ($tracks as $t) {
                    $id = $t['id'] ?? null;
                    if (!$id) continue;
                    if (isset($seen[$id])) continue;
                    if (in_array($id, $recentIds, true)) continue;

                    $seen[$id] = true;
                    $collected[] = $t;

                    if (count($collected) >= $limit) break;
                }

            } catch (\Exception $e) {
                \Log::warning("Spotify search attempt {$attempts} failed", [
                    'error' => $e->getMessage()
                ]);

                if ($attempts >= $maxAttempts) {
                    throw new \RuntimeException('No se pudieron obtener canciones de Spotify');
                }
            }
        }

        if (empty($collected)) {
            throw new \RuntimeException('No se pudieron obtener recomendaciones');
        }

        // Actualizar recientes
        $newRecent = array_values(array_unique(array_merge(
            $recentIds,
            array_map(fn($t) => $t['id'], $collected)
        )));

        if (count($newRecent) > 200) {
            $newRecent = array_slice($newRecent, -200);
        }

        Cache::put($recentKey, $newRecent, now()->addDays(7));

        // Normalizar salida
        $items = array_map(function($t) {
            $albumImages = $t['album']['images'] ?? [];
            $image = null;

            if (count($albumImages) > 1) {
                $image = $albumImages[1]['url'] ?? null;
            }
            if (!$image && !empty($albumImages)) {
                $image = $albumImages[0]['url'] ?? null;
            }

            return [
                'id'     => $t['id'],
                'uri'    => $t['uri'],
                'name'   => $t['name'],
                'artist' => $t['artists'][0]['name'] ?? 'Unknown Artist',
                'album'  => $t['album']['name'] ?? 'Unknown Album',
                'url'    => $t['external_urls']['spotify'] ?? null,
                'image'  => $image,
                'preview_url' => $t['preview_url'] ?? null,
                'popularity' => $t['popularity'] ?? 0,
            ];
        }, $collected);

        return [
            'search_terms' => $searchTerms,
            'tracks' => $items,
            'used_user_token' => (bool)$userToken,
        ];
    }

    private function getSearchTermsForEmotion(string $emotion): array
    {
        $terms = match(strtoupper($emotion)) {
            'HAPPY' => [
                'moods' => ['happy', 'upbeat', 'feel good', 'party', 'dance', 'cheerful'],
                'genres' => ['pop', 'dance', 'latin', 'funk'],
                'years' => ['2020', '2021', '2022', '2023', '2024']
            ],
            'SAD' => [
                'moods' => ['sad', 'melancholy', 'emotional', 'heartbreak', 'lonely'],
                'genres' => ['indie', 'acoustic', 'ballad', 'soul'],
                'years' => ['2020', '2021', '2022', '2023']
            ],
            'CALM' => [
                'moods' => ['relaxing', 'chill', 'peaceful', 'meditation', 'ambient'],
                'genres' => ['jazz', 'classical', 'acoustic', 'lofi'],
                'years' => ['2020', '2021', '2022', '2023']
            ],
            'ANGRY' => [
                'moods' => ['angry', 'aggressive', 'intense', 'powerful'],
                'genres' => ['rock', 'metal', 'punk', 'rap'],
                'years' => ['2020', '2021', '2022', '2023']
            ],
            'SURPRISED' => [
                'moods' => ['energetic', 'exciting', 'dynamic', 'uplifting'],
                'genres' => ['electronic', 'pop', 'edm', 'house'],
                'years' => ['2023', '2024']
            ],
            default => [
                'moods' => ['popular', 'top', 'trending'],
                'genres' => ['pop', 'rock', 'hip-hop'],
                'years' => ['2023', '2024']
            ]
        };

        return $terms;
    }

    private function buildSearchQuery(array $searchTerms, int $attempt): string
    {
        $queries = [];

        // Variar la búsqueda según el intento
        switch($attempt) {
            case 1:
                // Búsqueda por mood
                $mood = $searchTerms['moods'][array_rand($searchTerms['moods'])];
                $queries[] = $mood;
                break;

            case 2:
                // Búsqueda por género
                $genre = $searchTerms['genres'][array_rand($searchTerms['genres'])];
                $queries[] = "genre:{$genre}";
                break;

            case 3:
                // Búsqueda por año y mood
                $year = $searchTerms['years'][array_rand($searchTerms['years'])];
                $mood = $searchTerms['moods'][array_rand($searchTerms['moods'])];
                $queries[] = "year:{$year} {$mood}";
                break;

            case 4:
                // Búsqueda por género y año
                $genre = $searchTerms['genres'][array_rand($searchTerms['genres'])];
                $year = $searchTerms['years'][array_rand($searchTerms['years'])];
                $queries[] = "genre:{$genre} year:{$year}";
                break;

            default:
                // Búsqueda combinada
                $mood = $searchTerms['moods'][array_rand($searchTerms['moods'])];
                $genre = $searchTerms['genres'][array_rand($searchTerms['genres'])];
                $queries[] = "{$mood} {$genre}";
                break;
        }

        return implode(' ', $queries);
    }

    private function filterTracksByEmotion(array $tracks, string $emotion, string $token): array
    {
        // Filtrar por popularidad según la emoción
        $popularityRange = match(strtoupper($emotion)) {
            'HAPPY' => ['min' => 50, 'max' => 100],
            'SAD' => ['min' => 30, 'max' => 70],
            'CALM' => ['min' => 20, 'max' => 60],
            'ANGRY' => ['min' => 40, 'max' => 90],
            'SURPRISED' => ['min' => 60, 'max' => 100],
            default => ['min' => 30, 'max' => 100]
        };

        return array_filter($tracks, function($track) use ($popularityRange) {
            $popularity = $track['popularity'] ?? 50;
            return $popularity >= $popularityRange['min'] &&
                $popularity <= $popularityRange['max'];
        });
    }

    public function createPlaylistFor(User $user, string $name, array $trackUris, bool $public = false): ?array
    {
        if (empty($trackUris)) {
            throw new \InvalidArgumentException('Se requiere al menos un track para crear la playlist');
        }

        $connected = $this->connectionFor($user);
        $token = $this->ensureUserToken($connected);

        if (!$token) {
            Log::warning('Cannot create playlist: user not connected to Spotify', [
                'user_id' => $user->id
            ]);
            return null;
        }

        try {
            $me = $this->apiGet('me', $token);

            if (empty($me['id'])) {
                throw new \RuntimeException('No se pudo obtener el ID del usuario de Spotify');
            }

            $playlist = $this->apiPost("users/{$me['id']}/playlists", $token, [
                'name' => $name,
                'public' => $public,
                'description' => 'Generada por análisis de emociones',
            ]);

            // Spotify limita a 100 URIs por llamada
            $chunks = array_chunk($trackUris, 100);

            foreach ($chunks as $chunk) {
                $this->apiPost("playlists/{$playlist['id']}/tracks", $token, [
                    'uris' => $chunk,
                ]);
            }

            return $playlist;

        } catch (\Exception $e) {
            Log::error('Failed to create Spotify playlist', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            throw new \RuntimeException('Error al crear la playlist en Spotify: ' . $e->getMessage());
        }
    }

    public function testSpotifyAPI(?User $user = null): array
    {
        $connected = $user ? $this->connectionFor($user) : null;
        $userToken = $this->ensureUserToken($connected);
        $token = $userToken ?: $this->appToken();

        $results = [];

        // Test 1: Verificar que el token funciona con un endpoint simple
        try {
            $response = $this->api->get('browse/categories', [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'query' => ['limit' => 1]
            ]);
            $data = json_decode((string)$response->getBody(), true);
            $results['categories_test'] = [
                'success' => true,
                'has_data' => !empty($data['categories'])
            ];
        } catch (\Exception $e) {
            $results['categories_test'] = [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }

        // Test 2: Probar el endpoint de géneros disponibles
        try {
            $response = $this->api->get('recommendations/available-genre-seeds', [
                'headers' => ['Authorization' => "Bearer {$token}"]
            ]);
            $data = json_decode((string)$response->getBody(), true);
            $results['genres_test'] = [
                'success' => true,
                'genres_count' => count($data['genres'] ?? []),
                'sample_genres' => array_slice($data['genres'] ?? [], 0, 10)
            ];
        } catch (\Exception $e) {
            $results['genres_test'] = [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }

        // Test 3: Probar recommendations con parámetros mínimos
        try {
            // Usar SOLO seed_genres sin ningún otro parámetro
            $response = $this->api->get('recommendations', [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'query' => [
                    'seed_genres' => 'pop',
                    'limit' => 5
                ]
            ]);
            $data = json_decode((string)$response->getBody(), true);
            $results['recommendations_minimal'] = [
                'success' => true,
                'tracks_count' => count($data['tracks'] ?? [])
            ];
        } catch (\Exception $e) {
            $results['recommendations_minimal'] = [
                'success' => false,
                'error' => $e->getMessage(),
                'url_attempted' => 'recommendations?seed_genres=pop&limit=5'
            ];
        }

        // Test 4: Probar con market parameter
        try {
            $response = $this->api->get('recommendations', [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'query' => [
                    'seed_genres' => 'rock',
                    'limit' => 5,
                    'market' => 'US'
                ]
            ]);
            $data = json_decode((string)$response->getBody(), true);
            $results['recommendations_with_market'] = [
                'success' => true,
                'tracks_count' => count($data['tracks'] ?? [])
            ];
        } catch (\Exception $e) {
            $results['recommendations_with_market'] = [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }

        // Test 5: Probar con audio features
        try {
            $response = $this->api->get('recommendations', [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'query' => [
                    'seed_genres' => 'pop',
                    'limit' => 5,
                    'market' => 'US',
                    'target_valence' => 0.7,
                    'min_energy' => 0.5
                ]
            ]);
            $data = json_decode((string)$response->getBody(), true);
            $results['recommendations_with_features'] = [
                'success' => true,
                'tracks_count' => count($data['tracks'] ?? [])
            ];
        } catch (\Exception $e) {
            $results['recommendations_with_features'] = [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }

        // Info adicional
        $results['token_info'] = [
            'using_user_token' => (bool)$userToken,
            'token_length' => strlen($token),
            'token_prefix' => substr($token, 0, 10) . '...'
        ];

        $results['config'] = [
            'base_uri' => config('services.spotify.base_uri'),
            'market' => config('services.spotify.default_market')
        ];

        return $results;
    }

}
