<?php

namespace Database\Seeders;

use App\Support\SuperAdminRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class SuperAdminRoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::findOrCreate(SuperAdminRole::NAME, SuperAdminRole::GUARD);
    }
}
