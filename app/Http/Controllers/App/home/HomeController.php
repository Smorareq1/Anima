<?php

namespace App\Http\Controllers\App\home;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home', [
            'mensaje' => 'Bienvenido a Anima 🚀',
        ]);
    }

    public function handleError($any = null)
    {
        // Detecta el tipo de error basado en la URL o session
        $status = 404; // Por defecto 404
        
        // Puedes detectar otros errores aquí si es necesario
        if (session()->has('error_status')) {
            $status = session('error_status');
        }
        
        $errorConfig = [
            404 => [
                'title' => 'Página No Encontrada',
                'message' => 'La página que buscas no existe o ha sido movida.',
            ],
            419 => [
                'title' => 'Sesión Expirada', 
                'message' => 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            ],
            500 => [
                'title' => 'Error del Servidor',
                'message' => 'Algo salió mal en nuestro servidor. Por favor, intenta más tarde.',
            ]
        ];

        $config = $errorConfig[$status] ?? $errorConfig[404];

        return Inertia::render('Error', [
            'status' => $status,
            'title' => $config['title'],
            'message' => $config['message'],
        ]);
    }
}
