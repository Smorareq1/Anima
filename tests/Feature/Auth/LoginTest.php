<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Prueba que la página de login se muestra correctamente.
     */
    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/auth/login');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Login'));
    }

    /**
     * Prueba que un usuario puede iniciar sesión con credenciales válidas.
     */
    public function test_users_can_authenticate_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->post('/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);


        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('Dashboard'));
    }

    /**
     * Prueba que un usuario no puede iniciar sesión con una contraseña incorrecta.
     */
    public function test_users_cannot_authenticate_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->post('/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /**
     * Prueba que un usuario autenticado puede cerrar sesión.
     */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
                         ->post('/auth/logout');

        $this->assertGuest();
        $response->assertRedirect(route('Home'));
    }
}
