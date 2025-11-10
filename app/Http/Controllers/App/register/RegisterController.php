<?php

namespace App\Http\Controllers\App\register;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Register');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'username'   => 'required|string|max:255|unique:users',
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => ['required', 'confirmed', Password::min(8)],
        ],[
            'username.unique' => 'El nombre de usuario ya está en uso.',
            'email.unique' => 'El correo electrónico ya está en uso.',
        ]);

        $user = User::create($validated);

        Auth::login($user);

        // El backend se encarga de la redirección
        return redirect()->route('first.upload');
    }
}
