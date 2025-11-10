<?php

namespace Database\Factories;

use App\Models\Track;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrackFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Track::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'spotify_track_id' => $this->faker->unique()->regexify('[a-zA-Z0-9]{22}'),
            'name' => $this->faker->sentence(3),
            'artist' => $this->faker->name,
            'album' => $this->faker->words(3, true),
            'image_url' => $this->faker->imageUrl(),
            'preview_url' => $this->faker->url,
            'spotify_url' => $this->faker->url,
            'spotify_uri' => 'spotify:track:' . $this->faker->unique()->regexify('[a-zA-Z0-9]{22}'),
            'duration_ms' => $this->faker->numberBetween(30000, 300000),
            'popularity' => $this->faker->numberBetween(0, 100),
            'explicit' => $this->faker->boolean,
            'release_date' => $this->faker->date(),
        ];
    }
}
