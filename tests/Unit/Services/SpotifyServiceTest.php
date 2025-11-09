<?php

namespace Tests\Unit\Services;

use App\Services\Spotify\SpotifyService;
use App\Models\User;
use Tests\TestCase;
use Mockery;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class SpotifyServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testRecommendByEmotionsEnhancedWithEmptyEmotions(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Se requiere al menos una emoción');

        $service = Mockery::mock(SpotifyService::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $service->recommendByEmotionsEnhanced(null, [], 12);
    }

    public function testRecommendByEmotionsEnhancedReturnsValidStructure(): void
    {
        Http::fake([
            'https://accounts.spotify.com/api/token' => Http::response([
                'access_token' => 'fake_token',
                'expires_in' => 3600,
            ], 200),
            'https://api.spotify.com/v1/*' => Http::response([
                'playlists' => ['items' => []],
                'tracks' => ['items' => []],
                'items' => [],
            ], 200),
        ]);

        $service = new SpotifyService();

        $emotions = [
            ['type' => 'HAPPY', 'confidence' => 95.5],
        ];

        $result = $service->recommendByEmotionsEnhanced(null, $emotions, 5);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('emotion', $result);
        $this->assertArrayHasKey('confidence', $result);
        $this->assertArrayHasKey('tracks', $result);
        $this->assertArrayHasKey('emotions_used', $result);
        $this->assertArrayHasKey('method', $result);
        $this->assertArrayHasKey('used_user_token', $result);
        $this->assertArrayHasKey('market', $result);
    }

    public function testRecommendByEmotionsHandlesMultipleEmotions(): void
    {
        Http::fake([
            'https://accounts.spotify.com/api/token' => Http::response([
                'access_token' => 'fake_token',
                'expires_in' => 3600,
            ], 200),
            'https://api.spotify.com/v1/*' => Http::response([
                'playlists' => ['items' => []],
                'tracks' => ['items' => []],
                'items' => [],
            ], 200),
        ]);

        $service = new SpotifyService();

        $emotions = [
            ['type' => 'HAPPY', 'confidence' => 95.5],
            ['type' => 'SURPRISED', 'confidence' => 85.2],
            ['type' => 'CALM', 'confidence' => 75.8],
        ];

        $result = $service->recommendByEmotionsEnhanced(null, $emotions, 10);

        $this->assertIsArray($result);
        $this->assertCount(3, $result['emotions_used']);
        $this->assertEquals('HAPPY', $result['emotion']);
        $this->assertEquals(95.5, $result['confidence']);
    }

    public function testCreatePlaylistReturnsNullWhenNoSpotifyAccount(): void
    {
        $user = Mockery::mock(User::class);
        $user->shouldReceive('spotifyAccount')
            ->once()
            ->andReturn(null);

        $user->shouldReceive('getAttribute')
            ->with('id')
            ->andReturn(1);

        $service = new SpotifyService();
        $result = $service->createPlaylist($user, 'Test Playlist');

        $this->assertNull($result);
    }

    public function testAddTracksToPlaylistReturnsFalseWhenNoSpotifyAccount(): void
    {
        $user = Mockery::mock(User::class);
        $user->shouldReceive('spotifyAccount')
            ->once()
            ->andReturn(null);

        $service = new SpotifyService();
        $trackUris = ['spotify:track:1', 'spotify:track:2'];
        $result = $service->addTracksToPlaylist($user, 'playlist_123', $trackUris);

        $this->assertFalse($result);
    }

    public function testTestSpotifyAPIReturnsValidStructure(): void
    {
        Http::fake([
            'https://accounts.spotify.com/api/token' => Http::response([
                'access_token' => 'test_token',
                'expires_in' => 3600,
            ], 200),
            'https://api.spotify.com/v1/browse/categories' => Http::response([
                'categories' => ['items' => [['id' => 'pop']]],
            ], 200),
            'https://api.spotify.com/v1/recommendations/available-genre-seeds' => Http::response([
                'genres' => ['pop', 'rock', 'jazz'],
            ], 200),
            'https://api.spotify.com/v1/recommendations*' => Http::response([
                'tracks' => [['id' => 'track_1', 'name' => 'Test Track']],
            ], 200),
        ]);

        $service = new SpotifyService();
        $result = $service->testSpotifyAPI(null);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('categories_test', $result);
        $this->assertArrayHasKey('genres_test', $result);
        $this->assertArrayHasKey('recommendations_minimal', $result);
        $this->assertArrayHasKey('token_info', $result);
        $this->assertArrayHasKey('config', $result);
    }

    public function testEmotionTypesAreHandledCorrectly(): void
    {
        $service = new SpotifyService();

        $emotionTypes = ['HAPPY', 'SAD', 'CALM', 'ANGRY', 'SURPRISED'];

        foreach ($emotionTypes as $emotionType) {
            Http::fake([
                'https://accounts.spotify.com/api/token' => Http::response([
                    'access_token' => 'fake_token',
                    'expires_in' => 3600,
                ], 200),
                'https://api.spotify.com/v1/*' => Http::response([
                    'playlists' => ['items' => []],
                    'tracks' => ['items' => []],
                    'items' => [],
                ], 200),
            ]);

            $emotions = [['type' => $emotionType, 'confidence' => 90.0]];
            $result = $service->recommendByEmotionsEnhanced(null, $emotions, 5);

            $this->assertEquals($emotionType, $result['emotion']);
        }
    }
}
