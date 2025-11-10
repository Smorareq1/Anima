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
        ],
            [
            'username.unique' => 'El nombre de usuario ya está en uso.',
            'email.unique' => 'El correo electrónico ya está en uso.',
            'username.regex' => 'El nombre de usuario solo puede contener letras, números, espacios y guiones bajos.',
            'password.min' => 'La contraseña debe tener al menos :min caracteres.',
            'password.mixedCase' => 'La contraseña debe contener al menos una letra mayúscula y una minúscula.',
            'password.numbers' => 'La contraseña debe contener al menos un número.',
            'photo.image' => 'El archivo debe ser una imagen válida.',
            'photo.mimes' => 'La imagen debe ser un archivo de tipo: jpeg, png, jpg.',
            'photo.max' => 'La imagen no debe ser mayor de 2 MB.',
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
