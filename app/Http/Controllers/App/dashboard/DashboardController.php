<?php

namespace App\Http\Controllers\App\dashboard;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Página inicial del dashboard
        return Inertia::render('Dashboard/HomeDashboard');
    }
}
