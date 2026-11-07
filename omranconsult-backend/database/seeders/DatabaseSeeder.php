<?php

namespace Database\Seeders;

use Database\Seeders\Profile\ProfileContentSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SuperAdminRoleSeeder::class,
            ProfileContentSeeder::class,
        ]);
    }
}
