<?php

namespace App\Services\Image;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageCollageService
{
    /**
     * Crea un collage de 2x2 a partir de un array de URLs de imágenes.
     *
     * @param array $urls Las URLs de las imágenes a usar.
     * @param int $size El tamaño del lienzo cuadrado (ej. 640 para 640x640).
     * @return string|null La ruta relativa del collage guardado o null si falla.
     */
    public function createFromUrls(array $urls, int $size = 640): ?string
    {
        if (empty($urls) || !extension_loaded('gd')) {
            Log::warning('ImageCollageService: No se proporcionaron URLs o la extensión GD no está disponible.');
            return null;
        }

        try {
            $collage = imagecreatetruecolor($size, $size);
            imagealphablending($collage, false);
            imagesavealpha($collage, true);

            $backgroundColor = imagecolorallocatealpha($collage, 20, 20, 20, 0);
            imagefill($collage, 0, 0, $backgroundColor);

            $imageSources = array_slice($urls, 0, 4);
            $positions = [
                ['x' => 0, 'y' => 0], // Top-left
                ['x' => $size / 2, 'y' => 0], // Top-right
                ['x' => 0, 'y' => $size / 2], // Bottom-left
                ['x' => $size / 2, 'y' => $size / 2], // Bottom-right
            ];
            $itemSize = $size / 2;

            foreach ($imageSources as $index => $url) {
                // @ suprime errores si la URL no es válida, lo manejamos nosotros
                $imageData = @file_get_contents($url);
                if (!$imageData) continue;

                $sourceImage = @imagecreatefromstring($imageData);
                if (!$sourceImage) continue;

                $pos = $positions[$index];
                imagecopyresampled(
                    $collage, $sourceImage,
                    $pos['x'], $pos['y'], 0, 0,
                    $itemSize, $itemSize, imagesx($sourceImage), imagesy($sourceImage)
                );
                imagedestroy($sourceImage);
            }

            // Guardar la imagen en el almacenamiento público
            $directory = 'collages';
            $filename = uniqid('playlist_collage_', true) . '.jpg';
            $path = $directory . '/' . $filename;

            Storage::disk('public')->makeDirectory($directory);

            ob_start();
            imagejpeg($collage, null, 90);
            $imageContents = ob_get_clean();

            Storage::disk('public')->put($path, $imageContents);

            imagedestroy($collage);

            Log::info('Collage creado exitosamente en: ' . $path);
            return $path;

        } catch (\Throwable $e) {
            Log::error('Error creando el collage de la playlist', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }
}
