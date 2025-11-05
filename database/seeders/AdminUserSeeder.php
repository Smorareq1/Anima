<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'first_name' => 'Juan',
            'last_name' => 'Perez',
            'username' => 'admin',
            'email' => 'admin@gmail.com',
            'password' => 'Admin@1234',
            'email_verified_at' => now(),
        ]);
    }
}
