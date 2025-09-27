<?php

namespace App\Http\Controllers\App\dashboard;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecordController extends Controller
{
    public function index()
    {
        // Página de historial del dashboard
        return Inertia::render('Dashboard/Record');
    }
}
