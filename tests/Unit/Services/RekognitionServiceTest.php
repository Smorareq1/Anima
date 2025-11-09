<?php

namespace Tests\Unit\Services;

use App\Services\amazon\RekognitionService;
use Aws\Rekognition\RekognitionClient;
use Aws\Result;
use Tests\TestCase;
use Mockery;
use Illuminate\Support\Facades\File;

class RekognitionServiceTest extends TestCase
{
    protected $rekognitionClient;
    protected $rekognitionService;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'aws.region' => env('AWS_DEFAULT_REGION', 'us-east-2'),
            'aws.credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ]
        ]);

        $this->rekognitionClient = Mockery::mock(RekognitionClient::class);

        $this->rekognitionService = $this->getMockBuilder(RekognitionService::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock();

        $reflection = new \ReflectionClass($this->rekognitionService);
        $clientProperty = $reflection->getProperty('client');
        $clientProperty->setAccessible(true);
        $clientProperty->setValue($this->rekognitionService, $this->rekognitionClient);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testDetectEmotionWithResourceImages(): void
    {
        $resourcePath = base_path('tests/resources');
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

        $images = [];
        foreach ($imageExtensions as $ext) {
            $files = glob("{$resourcePath}/*.{$ext}", GLOB_BRACE);
            $images = array_merge($images, $files);
        }

        $this->assertNotEmpty($images, 'No se encontraron imágenes en tests/resources');

        $mockAwsResponse = $this->createMockResult([
            'FaceDetails' => [
                [
                    'Emotions' => [
                        ['Type' => 'HAPPY', 'Confidence' => 95.5],
                        ['Type' => 'SURPRISED', 'Confidence' => 85.2],
                        ['Type' => 'CALM', 'Confidence' => 75.8],
                    ]
                ]
            ]
        ]);

        $this->rekognitionClient
            ->shouldReceive('detectFaces')
            ->times(count($images))
            ->andReturn($mockAwsResponse);

        foreach ($images as $imagePath) {
            $result = $this->rekognitionService->detectEmotion($imagePath, 3);

            $this->assertIsArray($result, "El resultado debe ser un array para: " . basename($imagePath));
            $this->assertNotEmpty($result, "El resultado no debe estar vacío para: " . basename($imagePath));
        }
    }

    private function createMockResult(array $data): Result
    {
        $result = Mockery::mock(Result::class);
        $result->shouldReceive('offsetGet')
            ->andReturnUsing(function ($key) use ($data) {
                return $data[$key] ?? null;
            });

        foreach ($data as $key => $value) {
            $result->shouldReceive('offsetExists')
                ->with($key)
                ->andReturn(true);
        }

        return $result;
    }
}
