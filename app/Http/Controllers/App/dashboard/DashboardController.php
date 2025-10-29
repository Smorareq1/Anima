<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $mustCompleteProfile = empty($user->first_name) || empty($user->last_name);

        // Dentro de tu método Favoritos o dashboard del controller
        $data = [
            'ultimasPlaylists' => [
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

            'ultimasCanciones' => [
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

        $playlistData = $request->session()->get('playlistData');
        //datos mock

        return Inertia::render('Dashboard/HomeDashboard', [
            'recientesData' => $data,
            'mustCompleteProfile' => $mustCompleteProfile, //
        ]);
    }
}
