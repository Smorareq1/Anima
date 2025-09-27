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
        Schema::create('connected_accounts', function (Blueprint $table) {
            $table->id();
            // Relaciona esta cuenta con un usuario en tu tabla 'users'
            // Si el usuario es eliminado, sus cuentas conectadas también se eliminan.
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('provider');
            $table->string('provider_id');


            $table->text('token');
            $table->text('refresh_token')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            // Un usuario solo puede tener una cuenta por proveedor
            $table->unique(['user_id', 'provider']);

            // Un ID de proveedor solo puede estar asociado a una cuenta
            $table->unique(['provider', 'provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connected_accounts');
    }
};
