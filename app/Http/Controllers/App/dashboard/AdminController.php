<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        // datos mock
                $data = [
                    'usuarioMasActivo' => [
                        'nombre' => 'Erick Rivas',
                        'imagen' => '/images/perfil.png',
                    ],
                    'cancionMasEscuchada' => [
                        'titulo' => 'Blinding Lights',
                        'artista' => 'The Weeknd',
                        'veces' => 42,
                        'imagen' => '/images/songs/blinding_lights.jpg',
                    ],
                    'emocionMasPopular' => [
                        'nombre' => 'Feliz',
                        'icono' => '😄',
                    ],
                    'cancionesRecomendadas' => [
                        [
                            'nombre' => 'Blinding Lights',
                            'artista' => 'The Weeknd',
                            'veces' => 42,
                            'imagen' => '/images/songs/blinding_lights.jpg'
                        ],
                        [
                            'nombre' => 'Levitating',
                            'artista' => 'Dua Lipa',
                            'veces' => 37,
                            'imagen' => '/images/songs/levitating.jpg'
                        ],
                        [
                            'nombre' => 'As It Was',
                            'artista' => 'Harry Styles',
                            'veces' => 29,
                            'imagen' => '/images/songs/as_it_was.jpg'
                        ],
                        [
                            'nombre' => 'Dance Monkey',
                            'artista' => 'Tones and I',
                            'veces' => 26,
                            'imagen' => '/images/songs/dance_monkey.jpg'
                        ],
                        [
                            'nombre' => 'Stay',
                            'artista' => 'The Kid LAROI',
                            'veces' => 22,
                            'imagen' => '/images/songs/stay.jpg'
                        ],
                    ],
                    'usuariosActivos' => [
                        ['mes' => 'Ene', 'valor' => 30],
                        ['mes' => 'Feb', 'valor' => 26],
                        ['mes' => 'Mar', 'valor' => 22],
                    ],
                    'emocionesPopulares' => [
                        ['nombre' => 'Feliz', 'valor' => 30],
                        ['nombre' => 'Triste', 'valor' => 27],
                        ['nombre' => 'Enojado', 'valor' => 25],
                        ['nombre' => 'Calmado', 'valor' => 22],
                    ],
                    'usuariosSpotify' => [
                        ['mes' => 'Ene', 'valor' => 25],
                        ['mes' => 'Feb', 'valor' => 20],
                        ['mes' => 'Mar', 'valor' => 15],
                    ],
                ];

        return Inertia::render('Dashboard/Administrator', [
            'user' => Auth::user(),
            'dashboardData' => $data,
        ]);
    }
}
