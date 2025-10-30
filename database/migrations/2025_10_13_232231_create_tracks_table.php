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
        Schema::create('tracks', function (Blueprint $table) {
            // ID interno para la relación.
            $table->id();

            // ID de la canción en Spotify. Lo hacemos único para no duplicar canciones.
            $table->string('spotify_track_id')->unique();

            // Datos principales de la canción.
            $table->string('name', 512); // Aumentamos el tamaño por nombres largos.
            $table->string('artist');
            $table->string('album', 512); // Aumentamos el tamaño por nombres largos.

            // URLs y URIs.
            $table->string('image_url', 512)->nullable();
            $table->string('preview_url', 512)->nullable();
            $table->string('spotify_url', 512)->nullable();
            $table->string('spotify_uri');

            // Columna añadida duracion
            $table->integer('duration_ms')->nullable()->after('spotify_uri');

            // Metadatos adicionales.
            $table->integer('popularity')->nullable();
            $table->boolean('explicit')->default(false);
            $table->date('release_date')->nullable();

            // Timestamps de creación y actualización en nuestra base de datos.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tracks');
    }
};
