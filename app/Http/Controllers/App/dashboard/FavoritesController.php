<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class FavoritesController extends Controller
{
    public function index(Request $request)
    {
        // datos mock
    $data = [
        'playlistsFavoritas' => [
            [
                'id' => 1,
                'name' => 'Mood Booster',
                'songs' => 100,
                'date' => '2025-01-15',
                'image' => '/images/songs/blinding_lights.jpg',
            ],
            [
                'id' => 2,
                'name' => 'Focus Flow',
                'songs' => 50,
                'date' => '2024-12-10',
                'imagen' => '/images/songs/levitating.jpg',
            ],
            [
                'id' => 3,
                'name' => 'Lo-Fi Beats',
                'songs' => 20,
                'date' => '2024-11-05',
                'image' => '/images/songs/as_it_was.jpg',
            ],
            [
                'id' => 4,
                'name' => 'Chill Vibes',
                'songs' => 75,
                'date' => '2024-10-20',
                'image' => '/images/songs/dance_monkey.jpg',
            ],
            [
                'id' => 5,
                'name' => 'Top Hits 2024',
                'songs' => 150,
                'date' => '2024-09-15',
                'image' => '/images/songs/stay.jpg',
            ],
            [
            'id' => 6,
                'name' => 'Acoustic Afternoon',
                'songs' => 40,
                'date' => '2024-08-10',
                'image' => '/images/songs/shape_of_you.jpg',
            ],
            [
            'id' => 7,
                'name' => 'Workout Mix',
                'songs' => 60,
                'date' => '2024-07-05',
                'image' => '/images/songs/rockstar.jpg',
            ],
            [
            'id' => 8,
                'name' => 'Romantic Hits',
                'songs' => 80,
                'date' => '2024-06-20',
                'image' => '/images/songs/sunflower.jpg',
            ],
        ],

        'cancionesFavoritas' => [
            [
                'id' => 1,
                'titulo' => 'Atención',
                'artista' => 'Iván Cornejo',
                'album' => 'Mirada',
                'duracion' => '3:12',
                'imagen' => '/images/mock/atencion.jpg',
            ],
            [
                'id' => 2,
                'titulo' => 'Chinita Linda',
                'artista' => 'Álvaro Díaz',
                'album' => 'Felicilandia',
                'duracion' => '2:30',
                'imagen' => '/images/mock/chinita_linda.jpg',
            ],
            [
                'id' => 3,
                'titulo' => 'Devil in a New Dress',
                'artista' => 'Kanye West',
                'album' => 'My Beautiful Dark Twisted Fantasy',
                'duracion' => '5:20',
                'imagen' => '/images/mock/devil.jpg',
            ],
            [
                'id' => 4,
                'titulo' => 'Golden Hour',
                'artista' => 'JVKE',
                'album' => 'Golden Hour',
                'duracion' => '3:29',
                'imagen' => '/images/mock/golden_hour.jpg',
            ],
        ],
    ];
        return Inertia::render('Dashboard/Favorites', [
            'user' => Auth::user(),
            'favoritosData' => $data,
        ]);
    }
}
