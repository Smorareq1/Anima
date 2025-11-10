<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Prueba que la página de registro se muestra correctamente.
     */
    public function test_register_screen_can_be_rendered(): void
    {
        $response = $this->get('/auth/register');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Register'));
    }

    /**
     * Prueba que un nuevo usuario puede registrarse con datos válidos.
     */
    public function test_new_users_can_register(): void
    {
        $userData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->post('/auth/register', $userData);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'username' => 'testuser',
            'email' => 'test@example.com',
        ]);
        $response->assertRedirect(route('first.upload'));
    }

    /**
     * Prueba que el registro falla si el email ya existe.
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'dupe@example.com']);

        $response = $this->post('/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'username' => 'testuser',
            'email' => 'dupe@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /**
     * Prueba que el registro falla si las contraseñas no coinciden.
     */
    public function test_registration_fails_if_passwords_do_not_match(): void
    {
        $response = $this->post('/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password_NO_MATCH',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }
}
