<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            // Relación con el usuario que crea la playlist.
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Nombre de la playlist.
            $table->string('name');
            $table->string('main_emotion');
            $table->json('emotions_used');

            // El ID que devuelve Spotify al crear la playlist.
            $table->string('spotify_playlist_id')->nullable();
            $table->string('spotify_url')->nullable()->after('spotify_playlist_id');
            $table->string('playlist_image')->nullable()->after('spotify_url');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playlists');
    }
};

