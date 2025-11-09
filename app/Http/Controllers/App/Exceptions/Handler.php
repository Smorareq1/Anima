<?php
// app/Exceptions/Handler.php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        // PARA INERTIA: Siempre mostrar nuestra pantalla de error
        if ($request->header('X-Inertia')) {
            
            $status = method_exists($exception, 'getStatusCode') 
                ? $exception->getStatusCode() 
                : 500;
            
            return Inertia::render('Error', [
                'status' => $status,
                'title' => $this->getErrorTitle($status),
                'message' => $this->getErrorMessage($status),
            ]);
        }

        // PARA NO-INERTIA: Comportamiento normal de Laravel
        return parent::render($request, $exception);
    }

    protected function getErrorTitle(int $status): string
    {
        return match($status) {
            400 => 'Solicitud Incorrecta',
            401 => 'No Autorizado',
            403 => 'Acceso Denegado', 
            404 => 'Página No Encontrada',
            419 => 'Sesión Expirada',
            429 => 'Demasiadas Solicitudes',
            500 => 'Error del Servidor',
            503 => 'Servicio No Disponible',
            default => 'Error',
        };
    }

    protected function getErrorMessage(int $status): string
    {
        return match($status) {
            400 => 'La solicitud no pudo ser procesada.',
            401 => 'Necesitas iniciar sesión para acceder a esta página.',
            403 => 'No tienes permisos para acceder a este recurso.',
            404 => 'La página que buscas no existe o ha sido movida.',
            419 => 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            429 => 'Has realizado demasiadas solicitudes. Por favor, intenta más tarde.',
            500 => 'Algo salió mal en nuestro servidor. Por favor, intenta más tarde.',
            503 => 'El servicio está temporalmente no disponible.',
            default => 'Ha ocurrido un error inesperado.',
        };
    }
}