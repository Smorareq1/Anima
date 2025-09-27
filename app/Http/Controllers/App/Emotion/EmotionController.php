<?php

namespace App\Http\Controllers\App\Emotion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmotionController extends Controller
{
    public function firstTime()
    {
        return Inertia::render('FirstTimeUpload');
    }

    public function recommend()
    {
        return Inertia::render('Dashboard/Recommend');
    }

    public function upload(Request $request)
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
