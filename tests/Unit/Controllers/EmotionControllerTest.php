<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\App\Emotion\EmotionController;
use App\Models\User;
use App\Models\Playlist;
use App\Models\Track;
use App\Services\amazon\RekognitionService;
use App\Services\Spotify\SpotifyService;
use App\Services\Playlist\PlaylistService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Mockery;

class EmotionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $rekognitionMock;
    protected $spotifyMock;
    protected $playlistServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->rekognitionMock = Mockery::mock(RekognitionService::class);
        $this->spotifyMock = Mockery::mock(SpotifyService::class);
        $this->playlistServiceMock = Mockery::mock(PlaylistService::class);

        $this->app->instance(RekognitionService::class, $this->rekognitionMock);
        $this->app->instance(SpotifyService::class, $this->spotifyMock);
        $this->app->instance(PlaylistService::class, $this->playlistServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testFirstTimeRendersCorrectView(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('first.upload'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('FirstTimeUpload'));
    }

    public function testRecommendRendersCorrectView(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('recommend'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard/Recommend'));
    }

    public function testUploadRequiresImage(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('emotion.upload'), []);

        $response->assertSessionHasErrors(['photo']);
    }

    public function testUploadWithValidImageSucceeds(): void
    {
        Storage::fake('local');

        $image = UploadedFile::fake()->image('test.jpg');

        $emotions = [
            ['type' => 'HAPPY', 'confidence' => 95.5],
            ['type' => 'SURPRISED', 'confidence' => 85.2],
        ];

        $recommendations = [
            'emotion' => 'HAPPY',
            'confidence' => 95.5,
            'emotions_used' => $emotions,
            'method' => 'hybrid',
            'tracks' => [
                [
                    'id' => 'track_1',
                    'name' => 'Happy Song',
                    'artist' => 'Artist 1',
                    'uri' => 'spotify:track:track_1',
                ]
            ],
        ];

        $this->rekognitionMock
            ->shouldReceive('detectEmotion')
            ->once()
            ->andReturn($emotions);

        $this->spotifyMock
            ->shouldReceive('recommendByEmotionsEnhanced')
            ->once()
            ->andReturn($recommendations);

        $response = $this->actingAs($this->user)
            ->post(route('emotion.upload'), [
                'photo' => $image,
            ]);

        $response->assertRedirect(route('emotion.playlists.temp'));
        $response->assertSessionHas('playlistData');
    }

    public function testUploadWithNoEmotionsDetectedFails(): void
    {
        Storage::fake('local');

        $image = UploadedFile::fake()->image('test.jpg');

        $this->rekognitionMock
            ->shouldReceive('detectEmotion')
            ->once()
            ->andReturn([]);

        $response = $this->actingAs($this->user)
            ->post(route('emotion.upload'), [
                'photo' => $image,
            ]);

        $response->assertSessionHasErrors(['photo']);
    }

    public function testStoreRequiresPlaylistName(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('emotion.playlists.store'), []);

        $response->assertSessionHasErrors(['playlist_name']);
    }

    public function testStoreWithValidDataSucceeds(): void
    {
        $playlistData = [
            'emotion' => 'HAPPY',
            'confidence' => 95.5,
            'emotions_used' => [
                ['type' => 'HAPPY', 'confidence' => 95.5],
            ],
            'method_used' => 'hybrid',
            'tracks' => [
                [
                    'id' => 'track_1',
                    'name' => 'Happy Song',
                    'artist' => 'Artist 1',
                    'uri' => 'spotify:track:track_1',
                ]
            ],
        ];

        session(['playlistData' => $playlistData]);

        $playlist = Playlist::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Playlist',
        ]);

        $this->playlistServiceMock
            ->shouldReceive('createPlaylistFromRecommendation')
            ->once()
            ->andReturn($playlist);

        $response = $this->actingAs($this->user)
            ->post(route('emotion.playlists.store'), [
                'playlist_name' => 'Test Playlist',
            ]);

        $response->assertRedirect(route('emotion.playlists.show', $playlist->id));
        $response->assertSessionHas('success');
    }

    public function testStoreWithoutSessionDataFails(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('emotion.playlists.store'), [
                'playlist_name' => 'Test Playlist',
            ]);

        $response->assertSessionHasErrors(['message']);
    }

    public function testShowDisplaysPlaylistForOwner(): void
    {
        $playlist = Playlist::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'My Playlist',
        ]);

        $track = Track::factory()->create([
            'playlist_id' => $playlist->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('emotion.playlists.show', $playlist->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('PlaylistShow')
            ->has('playlist')
            ->where('playlist.id', $playlist->id)
            ->where('playlist.name', 'My Playlist')
        );
    }

    public function testShowFailsForNonOwner(): void
    {
        $otherUser = User::factory()->create();

        $playlist = Playlist::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('emotion.playlists.show', $playlist->id));

        $response->assertStatus(404);
    }

    public function testUploadValidatesImageFormat(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('document.pdf', 1000);

        $response = $this->actingAs($this->user)
            ->post(route('emotion.upload'), [
                'photo' => $file,
            ]);

        $response->assertSessionHasErrors(['photo']);
    }

    public function testUploadValidatesImageSize(): void
    {
        Storage::fake('local');

        $largeImage = UploadedFile::fake()->image('large.jpg')->size(11000);

        $response = $this->actingAs($this->user)
            ->post(route('emotion.upload'), [
                'photo' => $largeImage,
            ]);

        $response->assertSessionHasErrors(['photo']);
    }

    public function testStoreValidatesPlaylistNameLength(): void
    {
        session(['playlistData' => ['tracks' => []]]);

        $response = $this->actingAs($this->user)
            ->post(route('emotion.playlists.store'), [
                'playlist_name' => str_repeat('a', 101),
            ]);

        $response->assertSessionHasErrors(['playlist_name']);
    }
}
