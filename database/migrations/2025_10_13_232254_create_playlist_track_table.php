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
        // Tabla pivote para la relación muchos a muchos entre playlists y tracks.
        Schema::create('playlist_track', function (Blueprint $table) {
            $table->foreignId('playlist_id')->constrained()->cascadeOnDelete();
            $table->foreignId('track_id')->constrained()->cascadeOnDelete();

            // Definimos una clave primaria compuesta para evitar duplicados.
            $table->primary(['playlist_id', 'track_id']);
            $table->unsignedSmallInteger('track_number')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playlist_track');
    }
};
