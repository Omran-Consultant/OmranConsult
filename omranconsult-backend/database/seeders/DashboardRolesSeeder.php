<?php

namespace Database\Seeders;

use App\Support\DashboardPermission;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DashboardRolesSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (DashboardPermission::all() as $name) {
            Permission::findOrCreate($name, SuperAdminRole::GUARD);
        }

        $admin = Role::findOrCreate(SuperAdminRole::NAME, SuperAdminRole::GUARD);
        $admin->syncPermissions(DashboardPermission::all());

        $editor = Role::findOrCreate(EditorRole::NAME, EditorRole::GUARD);
        $editor->syncPermissions(DashboardPermission::editor());
    }
}
