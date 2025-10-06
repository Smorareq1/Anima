<?php

namespace App\Console\Commands;

use App\Services\amazon\RekognitionService;
use Illuminate\Console\Command;

class TestRekognition extends Command
{
    protected $signature = 'test:rekognition';
    protected $description = 'Prueba Rekognition detectando emociones';

    public function handle(RekognitionService $rekognition)
    {
        $path = storage_path('app/public/test-face.jpg');

        if (!file_exists($path)) {
            $this->error("No se encontró la imagen en: $path");
            return;
        }

        $emotion = $rekognition->detectEmotion($path);
        $this->info("Emoción detectada: {$emotion}");
    }
}
