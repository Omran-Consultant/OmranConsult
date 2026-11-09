<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\Auth\AccountLockout;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Seeders\DashboardRolesSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class EnsureE2eUsersCommand extends Command
{
    protected $signature = 'e2e:ensure-users';

    protected $description = 'Create or reset dedicated E2E dashboard users (local and testing only).';

    public function handle(AccountLockout $lockout): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->components->error('e2e:ensure-users is only available when APP_ENV is local or testing.');

            return self::FAILURE;
        }

        $email = strtolower(trim((string) env('E2E_ADMIN_EMAIL')));
        $password = (string) env('E2E_ADMIN_PASSWORD');

        $validator = Validator::make(
            ['email' => $email, 'password' => $password],
            [
                'email' => ['required', 'email'],
                'password' => ['required', 'string', Password::min(12)->mixedCase()->numbers()->symbols()],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->components->error($message);
            }

            return self::FAILURE;
        }

        $this->callSilently('db:seed', ['--class' => DashboardRolesSeeder::class]);

        $this->upsert($email, 'E2E Super Admin', SuperAdminRole::NAME, $password, $lockout);
        $this->upsert('e2e-editor@omran.test', 'E2E Editor', EditorRole::NAME, $password, $lockout);

        $this->components->info('E2E users are ready.');

        return self::SUCCESS;
    }

    private function upsert(string $email, string $name, string $role, string $password, AccountLockout $lockout): void
    {
        $user = User::query()->whereRaw('lower(email) = ?', [$email])->first();

        if ($user === null) {
            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'is_active' => true,
            ]);
        } else {
            $user->forceFill([
                'name' => $name,
                'password' => $password,
                'is_active' => true,
                'mfa_secret' => null,
                'mfa_recovery_codes' => null,
                'mfa_enabled_at' => null,
            ])->save();
        }

        $user->syncRoles([$role]);
        $lockout->reset($user->fresh());
    }
}
