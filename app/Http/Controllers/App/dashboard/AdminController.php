<?php

namespace App\Http\Controllers\App\dashboard;

use App\Http\Controllers\Controller;
use App\Services\App\dashboard\AdminDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    protected AdminDashboardService $dashboardService;

    public function __construct(AdminDashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Muestra el dashboard de administrador
     */
    public function index(Request $request)
    {
        try {
            $dashboardData = $this->dashboardService->getDashboardData();

            return Inertia::render('Dashboard/Administrator', [
                'user' => Auth::user(),
                'dashboardData' => $dashboardData,
            ]);
        } catch (\Exception $e) {
            // Log del error para debugging
            \Log::error('Error en AdminController@index: ' . $e->getMessage());

            // Retornar datos por defecto en caso de error
            return Inertia::render('Dashboard/Administrator', [
                'user' => Auth::user(),
                'dashboardData' => $this->getDefaultDashboardData(),
                'error' => 'Hubo un problema al cargar los datos del dashboard.'
            ]);
        }
    }

    /**
     * Obtiene estadísticas generales (endpoint adicional si lo necesitas)
     */
    public function getStats()
    {
        try {
            $stats = $this->dashboardService->getGeneralStats();

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las estadísticas'
            ], 500);
        }
    }

    /**
     * Datos por defecto en caso de error
     */
    private function getDefaultDashboardData(): array
    {
        return [
            'usuarioMasActivo' => [
                'nombre' => 'Sin datos',
                'imagen' => '/images/default-avatar.png',
            ],
            'cancionMasEscuchada' => [
                'titulo' => 'Sin datos',
                'artista' => 'N/A',
                'veces' => 0,
                'imagen' => '/images/default-song.jpg',
            ],
            'emocionMasPopular' => [
                'nombre' => 'Sin datos',
                'icono' => '😐',
            ],
            'cancionesRecomendadas' => [],
            'usuariosActivos' => [
                ['mes' => 'Ene', 'valor' => 0],
                ['mes' => 'Feb', 'valor' => 0],
                ['mes' => 'Mar', 'valor' => 0],
            ],
            'emocionesPopulares' => [],
            'usuariosSpotify' => [
                ['mes' => 'Ene', 'valor' => 0],
                ['mes' => 'Feb', 'valor' => 0],
                ['mes' => 'Mar', 'valor' => 0],
            ],
        ];
    }
}
