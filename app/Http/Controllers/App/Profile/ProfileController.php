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
        // La ruta está protegida por el middleware 'auth', por lo que podemos obtener al usuario de la solicitud.
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
            // Eliminar el avatar antiguo si existe
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('photo')->store('avatars', 'public');
            $updateData['avatar'] = $path;
        }

        $user->update($updateData);

        // La ruta de la API siempre espera una respuesta JSON.
        return response()->json([
            'message' => '¡Perfil actualizado con éxito!',
            'user' => $user->fresh() // Devuelve el usuario actualizado
        ], 200);
    }
}
