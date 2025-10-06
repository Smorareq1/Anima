<?php

namespace App\Http\Controllers\App\Emotion;

use App\Http\Controllers\Controller;
use App\Services\amazon\RekognitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmotionController extends Controller
{

    protected $rekognition;

    public function __construct(RekognitionService $rekognition)
    {
        $this->rekognition = $rekognition;
    }

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
        $fullPath = Storage::disk('public')->path($path);
        $emotions = $this->rekognition->detectEmotion($fullPath, 3); //Limite de emociones
        $mainEmotion = $emotions[0]['type'] ?? 'UNKNOWN';

        Storage::disk('public')->delete($path);

        return response()->json([
            'message' => 'Archivo recibido y analizado correctamente',
            'path' => $path,
            'main_emotion' => $mainEmotion,
            'emotions' => $emotions,
        ]);
    }
}
