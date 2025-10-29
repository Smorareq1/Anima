<?php

namespace App\Http\Controllers\App\dashboard;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    /**
     * Mostrar una  playlist específica.
     */
    public function show($id)
    {
        return Inertia::render('PlaylistShow', [
            'id' => $id
        ]);

    }
}
