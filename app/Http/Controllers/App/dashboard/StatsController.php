<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StatsController extends Controller
{
    public function playlistsPorEmocion(Request $request)
    {
        $userId = Auth::id();
        $emotion = strtoupper($request->query('emotion'));
        $inicio = Carbon::parse($request->query('inicio'));
        $fin = Carbon::parse($request->query('fin'));

        $playlists = DB::table('playlists')
            ->where('user_id', $userId)
            ->where('main_emotion', $emotion)
            ->whereBetween('created_at', [$inicio, $fin->endOfDay()])
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'main_emotion', 'created_at', 'playlist_image', 'spotify_url']);

        return response()->json($playlists);
    }

    public function index()
    {
        $user = Auth::user();
        $userId = $user->id;

        // === 1️⃣ EMOCIONES POR SEMANA ===
        $emocionesPorSemana = DB::table('playlists')
            ->select(
                DB::raw("date_trunc('week', created_at)::date AS semana_inicio"),
                DB::raw("(date_trunc('week', created_at) + interval '6 days')::date AS semana_fin"),
                'main_emotion',
                DB::raw('COUNT(*) as cantidad')
            )
            ->where('user_id', $userId)
            ->groupBy('semana_inicio', 'semana_fin', 'main_emotion')
            ->orderBy('semana_inicio', 'asc')
            ->get()
            ->groupBy(function ($item) {

                $inicio = \Carbon\Carbon::parse($item->semana_inicio)->locale('es')->isoFormat('D MMM');
                $fin = \Carbon\Carbon::parse($item->semana_fin)->locale('es')->isoFormat('D MMM');
                return "{$inicio} - {$fin}";
            })
            ->map(function ($grupo, $etiqueta) {
                $fila = ['semana' => $etiqueta];
                foreach ($grupo as $row) {
                    $fila[strtolower($row->main_emotion)] = $row->cantidad;
                }
                return $fila;
            })
            ->values();

        // === 2️⃣ ANÁLISIS POR DÍA (últimos 7 días) ===
        $analisisPorDia = DB::table('playlists')
            ->select(
                DB::raw('DATE(created_at) as dia'),
                DB::raw('COUNT(*) as cantidad')
            )
            ->where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(6))
            ->groupBy('dia')
            ->orderBy('dia', 'asc')
            ->get()
            ->map(function ($row) {
                return [
                    'dia' => date('d M', strtotime($row->dia)),
                    'cantidad' => $row->cantidad,
                ];
            });

        // === 3️⃣ POSITIVAS VS NEGATIVAS ===
        // Clasificación basada en tus mapeos:
        $positivas = ['HAPPY', 'CALM', 'SURPRISED'];
        $negativas = ['SAD', 'ANGRY', 'CONFUSED', 'DISGUSTED', 'FEAR'];

        $conteos = DB::table('playlists')
            ->select('main_emotion', DB::raw('COUNT(*) as total'))
            ->where('user_id', $userId)
            ->groupBy('main_emotion')
            ->pluck('total', 'main_emotion');

        $positivasTotal = $conteos->only($positivas)->sum();
        $negativasTotal = $conteos->only($negativas)->sum();

        $positivasVsNegativas = [
            [
                'tipo' => 'Positivas',
                'valor' => $positivasTotal,
                'emociones' => array_values($positivas),
            ],
            [
                'tipo' => 'Negativas',
                'valor' => $negativasTotal,
                'emociones' => array_values($negativas),
            ],
        ];

        // === 4️⃣ ÚLTIMAS EMOCIONES DETECTADAS ===
        $ultimasEmociones = DB::table('playlists')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['main_emotion', 'created_at'])
            ->map(function ($row) {
                return [
                    'fecha' => date('Y-m-d', strtotime($row->created_at)),
                    'nombre' => match ($row->main_emotion) {
                        'HAPPY' => 'Feliz',
                        'SAD' => 'Triste',
                        'ANGRY' => 'Enojado',
                        'CALM' => 'Calmado',
                        'SURPRISED' => 'Sorprendido',
                        'CONFUSED' => 'Confundido',
                        'DISGUSTED' => 'Disgustado',
                        'FEAR' => 'Miedo',
                        default => ucfirst(strtolower($row->main_emotion)),
                    },
                    'icono' => match ($row->main_emotion) {
                        'HAPPY' => '😊',
                        'SAD' => '😢',
                        'ANGRY' => '😠',
                        'CALM' => '😌',
                        'SURPRISED' => '😮',
                        'CONFUSED' => '😕',
                        'DISGUSTED' => '🤢',
                        'FEAR' => '😨',
                        default => '🙂',
                    },
                ];
            });

        // === Consolidar todo ===
        $stats = [
            'emocionesPorSemana' => $emocionesPorSemana,
            'analisisPorDia' => $analisisPorDia,
            'positivasVsNegativas' => $positivasVsNegativas,
            'ultimasEmociones' => $ultimasEmociones,
        ];

        return Inertia::render('Dashboard/Stats', [
            'statsData' => $stats,
        ]);
    }
}
