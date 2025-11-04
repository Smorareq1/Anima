<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class StatsController extends Controller
{
    public function index()
    {
        $emocionesPorSemana = [
            ['semana' => 'Semana 1', 'feliz' => 4, 'triste' => 2, 'enojado' => 1, 'neutral' => 3],
            ['semana' => 'Semana 2', 'feliz' => 6, 'triste' => 1, 'enojado' => 0, 'neutral' => 2],
            ['semana' => 'Semana 3', 'feliz' => 3, 'triste' => 2, 'enojado' => 2, 'neutral' => 4],
        ];

        // 👇 Calcular totales en el backend
        $totales = [
            [
                'nombre' => 'Feliz',
                'cantidad' => array_sum(array_column($emocionesPorSemana, 'feliz')),
            ],
            [
                'nombre' => 'Triste',
                'cantidad' => array_sum(array_column($emocionesPorSemana, 'triste')),
            ],
            [
                'nombre' => 'Enojado',
                'cantidad' => array_sum(array_column($emocionesPorSemana, 'enojado')),
            ],
            [
                'nombre' => 'Neutral',
                'cantidad' => array_sum(array_column($emocionesPorSemana, 'neutral')),
            ],
        ];

        $stats = [
            'emocionesPorSemana' => $emocionesPorSemana,
            'totalesEmociones' => $totales,
            'analisisPorDia' => [
                ['dia' => 'Lunes', 'cantidad' => 2],
                ['dia' => 'Martes', 'cantidad' => 3],
                ['dia' => 'Miércoles', 'cantidad' => 5],
                ['dia' => 'Jueves', 'cantidad' => 1],
                ['dia' => 'Viernes', 'cantidad' => 4],
            ],
            'positivasVsNegativas' => [
                ['tipo' => 'Positivas', 'valor' => 15],
                ['tipo' => 'Negativas', 'valor' => 7],
            ],
            'ultimasEmociones' => [
                ['fecha' => '2025-11-01', 'nombre' => 'Feliz', 'icono' => '😊'],
                ['fecha' => '2025-10-30', 'nombre' => 'Triste', 'icono' => '😢'],
                ['fecha' => '2025-10-29', 'nombre' => 'Sorprendido', 'icono' => '😮'],
            ],
        ];

        return Inertia::render('Dashboard/Stats', [
            'statsData' => $stats,
        ]);
    }
}
