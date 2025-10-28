<?php

namespace Tests\Unit\Services;

use App\Services\amazon\RekognitionService;
use Aws\Rekognition\RekognitionClient;
use Aws\Result;
use InvalidArgumentException;
use Tests\TestCase;
use Mockery;

class RekognitionServiceTest extends TestCase
{
    protected $rekognitionClient;
    protected $rekognitionService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set AWS configuration from .env for testing
        config([
            'aws.region' => env('AWS_DEFAULT_REGION', 'us-east-2'),
            'aws.credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ]
        ]);
        
        $this->rekognitionClient = Mockery::mock(RekognitionClient::class);
        
        // Create service without calling constructor to avoid real AWS client creation
        $this->rekognitionService = $this->getMockBuilder(RekognitionService::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock();
        
        // Use reflection to inject the mocked client
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

    public function testDetectEmotionWithValidImage(): void
    {
        $imagePath = 'tests/resources/happy_face.jpeg';
        $limit = 3;
        
        // Verify image file exists
        $this->assertFileExists($imagePath, 'Test image file is missing');
        
        // Mock AWS response with emotions
        $awsResponse = $this->createMockResult([
            'FaceDetails' => [
                [
                    'Emotions' => [
                        ['Type' => 'HAPPY', 'Confidence' => 95.5],
                        ['Type' => 'SURPRISED', 'Confidence' => 85.2],
                        ['Type' => 'CALM', 'Confidence' => 75.8],
                        ['Type' => 'SAD', 'Confidence' => 25.1],
                    ]
                ]
            ]
        ]);

        $this->rekognitionClient
            ->shouldReceive('detectFaces')
            ->once()
            ->with(Mockery::on(function ($arg) {
                return isset($arg['Image']['Bytes']) && isset($arg['Attributes']) && $arg['Attributes'] === ['ALL'];
            }))
            ->andReturn($awsResponse);

        $result = $this->rekognitionService->detectEmotion($imagePath, $limit);

        $this->assertIsArray($result);
        $this->assertCount(3, $result);
        
        // Check that emotions are sorted by confidence (descending)
        $this->assertEquals('HAPPY', $result[0]['type']);
        $this->assertEquals(95.5, $result[0]['confidence']);
        $this->assertEquals('SURPRISED', $result[1]['type']);
        $this->assertEquals(85.2, $result[1]['confidence']);
        $this->assertEquals('CALM', $result[2]['type']);
        $this->assertEquals(75.8, $result[2]['confidence']);
    }

    public function testDetectEmotionWithNoFaceDetails(): void
    {
        $imagePath = 'tests/resources/no_face.jpg'; // Imagen SIN caras
        $limit = 3;
        
        
        // Mock AWS response with no face details
        $awsResponse = $this->createMockResult([
            'FaceDetails' => []
        ]);

        $this->rekognitionClient
            ->shouldReceive('detectFaces')
            ->once()
            ->andReturn($awsResponse);

        $result = $this->rekognitionService->detectEmotion($imagePath, $limit);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    public function testDetectEmotionWithEmptyEmotionsArray(): void
    {
        $imagePath = 'tests/resources/unclear_face.jpg'; // Cara borrosa
        $limit = 3;
        
        
        // Mock AWS response with face but no emotions
        $awsResponse = $this->createMockResult([
            'FaceDetails' => [
                [
                    'Emotions' => []
                ]
            ]
        ]);

        $this->rekognitionClient
            ->shouldReceive('detectFaces')
            ->once()
            ->andReturn($awsResponse);

        $result = $this->rekognitionService->detectEmotion($imagePath, $limit);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    public function testDetectEmotionLimitFiltering(): void
    {
        $imagePath = 'tests/resources/multiple_emotions.jpg'; // Emociones mixtas
        $limit = 2;
        
        
        // Mock AWS response with more emotions than limit
        $awsResponse = $this->createMockResult([
            'FaceDetails' => [
                [
                    'Emotions' => [
                        ['Type' => 'HAPPY', 'Confidence' => 95.5],
                        ['Type' => 'SURPRISED', 'Confidence' => 85.2],
                        ['Type' => 'CALM', 'Confidence' => 75.8],
                        ['Type' => 'SAD', 'Confidence' => 25.1],
                        ['Type' => 'ANGRY', 'Confidence' => 15.3],
                    ]
                ]
            ]
        ]);

        $this->rekognitionClient
            ->shouldReceive('detectFaces')
            ->once()
            ->andReturn($awsResponse);

        $result = $this->rekognitionService->detectEmotion($imagePath, $limit);

        $this->assertIsArray($result);
        $this->assertCount(2, $result); // Should respect the limit
        $this->assertEquals('HAPPY', $result[0]['type']);
        $this->assertEquals('SURPRISED', $result[1]['type']);
    }

    public function testDetectEmotionConfidenceRounding(): void
    {
        $imagePath = 'tests/resources/moderate_emotion.jpg'; // Emoción moderada
        $limit = 1;
        
        
        // Mock AWS response with decimal confidence
        $awsResponse = $this->createMockResult([
            'FaceDetails' => [
                [
                    'Emotions' => [
                        ['Type' => 'HAPPY', 'Confidence' => 95.123456],
                    ]
                ]
            ]
        ]);

        $this->rekognitionClient
            ->shouldReceive('detectFaces')
            ->once()
            ->andReturn($awsResponse);

        $result = $this->rekognitionService->detectEmotion($imagePath, $limit);

        $this->assertEquals(95.12, $result[0]['confidence']); // Should be rounded to 2 decimal places
    }

    public function testDetectEmotionWithFileNotFound(): void
    {
        $imagePath = 'nonexistent/path/image.jpg';
        $limit = 3;
        
        // This test intentionally uses a non-existent path

        $this->expectException(\ErrorException::class);
        
        $this->rekognitionService->detectEmotion($imagePath, $limit);
    }

    public function testDetectEmotionSorting(): void
    {
        $imagePath = 'tests/resources/complex_expression.jpg'; // Expresión compleja
        $limit = 5;
        
        
        // Mock AWS response with unsorted emotions
        $awsResponse = $this->createMockResult([
            'FaceDetails' => [
                [
                    'Emotions' => [
                        ['Type' => 'SAD', 'Confidence' => 25.1],
                        ['Type' => 'HAPPY', 'Confidence' => 95.5],
                        ['Type' => 'CALM', 'Confidence' => 75.8],
                        ['Type' => 'SURPRISED', 'Confidence' => 85.2],
                    ]
                ]
            ]
        ]);

        $this->rekognitionClient
            ->shouldReceive('detectFaces')
            ->once()
            ->andReturn($awsResponse);

        $result = $this->rekognitionService->detectEmotion($imagePath, $limit);

        // Verify sorting is correct (descending by confidence)
        $confidences = array_column($result, 'confidence');
        $this->assertEquals([95.5, 85.2, 75.8, 25.1], $confidences);
    }

    public function testAwsCredentialsAreConfiguredFromEnv(): void
    {
        // Verify that AWS credentials from .env are properly loaded
        $this->assertNotNull(env('AWS_ACCESS_KEY_ID'), 'AWS_ACCESS_KEY_ID should be set in .env');
        $this->assertNotNull(env('AWS_SECRET_ACCESS_KEY'), 'AWS_SECRET_ACCESS_KEY should be set in .env');
        $this->assertNotNull(env('AWS_DEFAULT_REGION'), 'AWS_DEFAULT_REGION should be set in .env');
        
        // Verify config values match .env values
        $this->assertEquals(env('AWS_DEFAULT_REGION'), config('aws.region'));
        $this->assertEquals(env('AWS_ACCESS_KEY_ID'), config('aws.credentials.key'));
        $this->assertEquals(env('AWS_SECRET_ACCESS_KEY'), config('aws.credentials.secret'));
        
        // Verify specific values from .env file
        $this->assertEquals('AKIAV4VNCRYV66AAN55H', config('aws.credentials.key'));
        $this->assertEquals('us-east-2', config('aws.region'));
    }

    /**
     * Helper method to create mock AWS Result object
     */
    private function createMockResult(array $data): Result
    {
        $result = Mockery::mock(Result::class);
        $result->shouldReceive('offsetGet')
            ->andReturnUsing(function ($key) use ($data) {
                return $data[$key] ?? null;
            });
        
        // Mock array access behavior
        foreach ($data as $key => $value) {
            $result->shouldReceive('offsetExists')
                ->with($key)
                ->andReturn(true);
        }
        
        return $result;
    }
}