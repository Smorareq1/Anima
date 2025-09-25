<?php

namespace App\Http\Controllers\App\Emotion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmotionController extends Controller
{
    public function index()
    {
        return Inertia::render('FirstTimeUpload');
    }
    public function upload(Request $request) //revisar esta parte
        {
            $request->validate([
                'photo' => 'required|image|mimes:jpg,jpeg,png|max:122880',
            ]);

            $path = $request->file('photo')->store('emotions', 'public');

            return response()->json([
                'message' => 'Archivo recibido correctamente',
                'path' => $path,
            ]);
        }
}
