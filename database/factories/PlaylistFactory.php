<?php

namespace Database\Factories;

use App\Models\Playlist;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlaylistFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Playlist::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->sentence(3),
            'main_emotion' => $this->faker->randomElement(['HAPPY', 'SAD', 'ANGRY', 'RELAXED']),
            'emotions_used' => ['HAPPY'],
            'spotify_playlist_id' => null,
            'spotify_url' => null,
            'playlist_image' => $this->faker->imageUrl(),
        ];
    }
}
