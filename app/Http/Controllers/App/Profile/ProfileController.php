<?php

namespace App\Http\Controllers\App\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'first_name' => ['required', 'string', 'min:2', 'max:50'],
            'last_name' => ['required', 'string', 'min:2', 'max:50'],
            'username' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-zA-Z0-9_\s]+$/', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::min(8)->mixedCase()->numbers()],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        $updateData = $request->only('first_name', 'last_name', 'username', 'email');

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('photo')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('photo')->store('avatars', 'public');
            $updateData['avatar'] = $path;
        }

        $user->update($updateData);

        // Si la petición espera JSON (es una llamada de API), devolvemos JSON.
        if ($request->expectsJson()) {
            return response()->json([
                'message' => '¡Perfil actualizado con éxito!',
                'user' => $user->fresh()
            ], 200);
        }

        // Si no, es una petición web normal (Inertia), y redirigimos.
        return redirect()->back()->with('success', '¡Perfil actualizado con éxito!');
    }
}
