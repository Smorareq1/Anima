<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * El Blade root que carga tu app Inertia.
     */
    protected $rootView = 'app'; // cambia a tu layout blade si es otro

    /**
     * Props que se comparten con todas las vistas Inertia.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => Auth::check()
                    ? Auth::user()->only(['id', 'username', 'first_name', 'last_name', 'email', 'avatar'])
                    : null,
            ],
            'hasSpotify' => true,
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'playlist' => fn () => $request->session()->get('playlist'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
