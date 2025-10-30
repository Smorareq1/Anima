<?php

namespace App\Services\amazon;

use Aws\Rekognition\RekognitionClient;
use Illuminate\Support\Facades\Log;

class RekognitionService
{
    protected $client;

    public function __construct()
    {
        // Verificar que las credenciales existan
        $key = config('aws.credentials.key') ?? env('AWS_ACCESS_KEY_ID');
        $secret = config('aws.credentials.secret') ?? env('AWS_SECRET_ACCESS_KEY');
        $region = config('aws.region') ?? env('AWS_DEFAULT_REGION', 'us-east-2');

        if (empty($key) || empty($secret)) {
            Log::warning('AWS credentials not configured, RekognitionService disabled');
            $this->client = null;
            return;
        }

        try {
            $this->client = new RekognitionClient([
                'region' => $region,
                'version' => 'latest',
                'credentials' => [
                    'key' => $key,
                    'secret' => $secret,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to initialize Rekognition client: ' . $e->getMessage());
            $this->client = null;
        }
    }

    public function isAvailable(): bool
    {
        return $this->client !== null;
    }

    public function detectEmotion($imagePath, $limit)
    {
        if (!$this->isAvailable()) {
            throw new \RuntimeException('Rekognition service is not available');
        }

        $bytes = file_get_contents($imagePath);

        $result = $this->client->detectFaces([
            'Image' => ['Bytes' => $bytes],
            'Attributes' => ['ALL'],
        ]);

        $emotions = $result['FaceDetails'][0]['Emotions'] ?? [];

        usort($emotions, fn($a, $b) => $b['Confidence'] <=> $a['Confidence']);

        //Limitar cantidad
        $topEmotions = array_slice($emotions, 0, $limit);

        // Devolver formato simplificado
        return array_map(fn($e) => [
            'type' => $e['Type'],
            'confidence' => round($e['Confidence'], 2)
        ], $topEmotions);
    }
}
