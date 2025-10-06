<?php

namespace App\Services\amazon;

use Aws\Rekognition\RekognitionClient;

class RekognitionService
{
    protected $client;

    public function __construct()
    {
        $this->client = new RekognitionClient([
            'region' => config('aws.region'),
            'version' => 'latest',
            'credentials' => config('aws.credentials'),
        ]);
    }

    public function detectEmotion($imagePath)
    {
        $bytes = file_get_contents($imagePath);

        $result = $this->client->detectFaces([
            'Image' => ['Bytes' => $bytes],
            'Attributes' => ['ALL'],
        ]);

        $emotions = $result['FaceDetails'][0]['Emotions'] ?? [];

        usort($emotions, fn($a, $b) => $b['Confidence'] <=> $a['Confidence']);

        return $emotions[0]['Type'] ?? 'UNKNOWN';
    }
}
