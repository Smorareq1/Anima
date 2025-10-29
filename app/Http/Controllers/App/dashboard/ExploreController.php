<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ExploreController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $data = [
            'playlistRecomendada' => [
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
                    'date' => '2025-01-15',
                    'image' => '/images/songs/levitating.jpg',
                ],
                [
                    'id' => 3,
                    'name' => 'Lo-Fi Beats',
                    'songs' => 20,
                    'date' => '2025-01-15',
                    'image' => '/images/songs/as_it_was.jpg',
                ],
            ],

            'cancionesRecomendadas' => [
                [
                    'id' => 1,
                    'name' => 'Atención',
                    'artist' => 'Iván Cornejo',
                    'album' => 'Mirada',
                    'duracion' => '3:12',
                    'image' => '/images/mock/atencion.jpg',
                ],
                [
                    'id' => 2,
                    'name' => 'Chinita Linda',
                    'artist' => 'Álvaro Díaz',
                    'album' => 'Felicilandia',
                    'duracion' => '2:30',
                    'image' => '/images/mock/chinita_linda.jpg',
                ],
                [
                    'id' => 3,
                    'name' => 'Devil in a New Dress',
                    'artist' => 'Kanye West',
                    'album' => 'My Beautiful Dark Twisted Fantasy',
                    'duracion' => '5:20',
                    'image' => '/images/mock/devil.jpg',
                ],
                [
                    'id' => 4,
                    'name' => 'Golden Hour',
                    'artist' => 'JVKE',
                    'album' => 'Golden Hour',
                    'duracion' => '3:29',
                    'image' => '/images/mock/golden_hour.jpg',
                ],
            ],
        ];

        $playlistData = $request->session()->get('playlistData');
        //datos mock

        return Inertia::render('Dashboard/Explore', [
            'explorarData' => $data,
            'user' => $user,
        ]);
    }
}
