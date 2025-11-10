<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\App\dashboard\FavoritesController;
use App\Models\User;
use App\Models\Playlist;
use App\Models\Track;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Mockery;
use Tests\TestCase;

class FavoritesControllerTest extends TestCase
{

    protected function setUp(): void
    {
        parent::setUp();
        Auth::shouldReceive('user')->byDefault();
        Inertia::shouldReceive('render')->byDefault();
        Storage::shouldReceive('url')->byDefault();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Prueba que el método index renderiza la vista con datos formateados.
     */
    public function test_index_returns_favorites_page_with_data()
    {
        // Mocks and Real Objects
        $user = Mockery::mock(User::class);
        $track = new Track([
            'id' => 101,
            'name' => 'Test Track',
            'artist' => 'Test Artist',
            'album' => 'Test Album',
            'duration_ms' => 180000,
            'image_url' => 'http://image.url/track.jpg',
            'spotify_url' => 'http://spotify.url/track',
        ]);

        $playlist = new Playlist([
            'id' => 1,
            'name' => 'Test Playlist',
            'main_emotion' => 'HAPPY',
            'playlist_image' => 'path/to/image.jpg',
        ]);
        $playlist->created_at = Carbon::now();
        $playlist->setRelation('tracks', new Collection([$track]));

        $relationMock = Mockery::mock(BelongsToMany::class);

        // Facade and Mock Expectations
        Auth::shouldReceive('user')->once()->andReturn($user);
        $user->shouldReceive('favoritePlaylists')->once()->andReturn($relationMock);

        $relationMock->shouldReceive('with')->once()->with('tracks')->andReturnSelf();
        $relationMock->shouldReceive('get')->once()->andReturn(new Collection([$playlist]));

        Storage::shouldReceive('url')->with('path/to/image.jpg')->andReturn('http://storage.url/path/to/image.jpg');

        Inertia::shouldReceive('render')
            ->once()
            ->with(
                'Dashboard/Favorites',
                Mockery::on(function ($data) {
                    $this->assertEquals('Test Playlist', $data['favoritosData']['playlistsFavoritas'][0]['name']);
                    $this->assertEquals(1, $data['favoritosData']['playlistsFavoritas'][0]['songs']);
                    $this->assertEquals('Test Track', $data['favoritosData']['cancionesFavoritas'][0]['titulo']);
                    $this->assertEquals('http://storage.url/path/to/image.jpg', $data['favoritosData']['playlistsFavoritas'][0]['image']);
                    return true;
                })
            )
            ->andReturn(Mockery::mock('Inertia\Response'));

        // Controller Action
        $controller = new FavoritesController();
        $response = $controller->index();

        // Assertions
        $this->assertInstanceOf('Inertia\Response', $response);
    }

    /**
     * Prueba que el toggle añade un favorito.
     */
    public function test_toggle_favorite_adds_a_favorite()
    {
        $request = Mockery::mock(Request::class);
        $user = Mockery::mock(User::class);
        $playlistId = 123;

        Auth::shouldReceive('user')->once()->andReturn($user);

        $request->shouldReceive('validate')->once()->with(['playlist_id' => 'required|integer|exists:playlists,id']);
        $request->shouldReceive('input')->once()->with('playlist_id')->andReturn($playlistId);

        $relationMock = Mockery::mock(BelongsToMany::class);
        $relationMock->shouldReceive('toggle')->with($playlistId);
        $relationMock->shouldReceive('where')->with('playlist_id', $playlistId)->andReturnSelf();
        $relationMock->shouldReceive('exists')->andReturn(true);

        $user->shouldReceive('favoritePlaylists')->andReturn($relationMock);

        $controller = new FavoritesController();
        $response = $controller->toggleFavorite($request);
        $data = $response->getData(true);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('added', $data['status']);
    }

    /**
     * Prueba que el toggle elimina un favorito.
     */
    public function test_toggle_favorite_removes_a_favorite()
    {
        $request = Mockery::mock(Request::class);
        $user = Mockery::mock(User::class);
        $playlistId = 123;

        Auth::shouldReceive('user')->once()->andReturn($user);
        $request->shouldReceive('validate')->once();
        $request->shouldReceive('input')->once()->with('playlist_id')->andReturn($playlistId);

        $relationMock = Mockery::mock(BelongsToMany::class);
        $relationMock->shouldReceive('toggle')->with($playlistId);
        $relationMock->shouldReceive('where')->with('playlist_id', $playlistId)->andReturnSelf();
        $relationMock->shouldReceive('exists')->andReturn(false);

        $user->shouldReceive('favoritePlaylists')->andReturn($relationMock);

        $controller = new FavoritesController();
        $response = $controller->toggleFavorite($request);
        $data = $response->getData(true);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('removed', $data['status']);
    }
}
