<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\SuperAdminRole;
use Database\Seeders\SuperAdminRoleSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class InstallSuperAdminCommand extends Command
{
    protected $signature = 'omranconsult:install-super-admin';

    protected $description = 'Create the initial Super Admin when no users exist (reads ADMIN_EMAIL and ADMIN_PASSWORD from the environment).';

    public function handle(): int
    {
        if (User::query()->exists()) {
            $this->components->error('Bootstrap refused: the users table is not empty.');

            return self::FAILURE;
        }

        $credentials = [
            'email' => env('ADMIN_EMAIL'),
            'password' => env('ADMIN_PASSWORD'),
        ];

        $validator = Validator::make($credentials, [
            'email' => ['required', 'email'],
            'password' => ['required', 'string', Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->components->error($message);
            }

            return self::FAILURE;
        }

        $this->call(SuperAdminRoleSeeder::class);

        $user = User::query()->create([
            'name' => 'Super Admin',
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ]);

        $user->assignRole(SuperAdminRole::NAME);

        $this->components->info('Super Admin account created and super_admin role assigned.');

        return self::SUCCESS;
    }
}
