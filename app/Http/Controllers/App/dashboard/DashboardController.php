<?php

namespace App\Http\Controllers\App\dashboard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController
{
    public function index()
    {
        // Página inicial del dashboard
        return Inertia::render('Dashboard/HomeDashboard');
    }
}
