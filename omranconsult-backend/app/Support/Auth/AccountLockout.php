<?php

namespace App\Support\Auth;

use App\Models\User;
use App\Support\Audit\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

final class AccountLockout
{
    public const MAX_ATTEMPTS = 5;

    public const WINDOW_MINUTES = 15;

    public const LOCK_MINUTES = 15;

    public function __construct(private readonly AuditLogger $audit) {}

    public function isLocked(User $user): bool
    {
        return $user->locked_until !== null && $user->locked_until->isFuture();
    }

    public function minutesRemaining(User $user): int
    {
        if (! $this->isLocked($user)) {
            return 0;
        }

        // Round up: a fresh 15-minute lock must read 15, not 14.
        return (int) max(1, ceil($user->locked_until->diffInMinutes(now(), true)));
    }

    public function recordFailure(User $user, Request $request): void
    {
        $key = $this->windowKey($user);
        $failures = (int) Cache::get($key, 0) + 1;
        Cache::put($key, $failures, now()->addMinutes(self::WINDOW_MINUTES));

        $user->forceFill([
            'failed_login_count' => $user->failed_login_count + 1,
        ])->save();

        $this->audit->write($user, 'login_failed', User::class, $user->id, null, $request);

        if ($failures >= self::MAX_ATTEMPTS) {
            $user->forceFill([
                'locked_until' => now()->addMinutes(self::LOCK_MINUTES),
                'failed_login_count' => 0,
            ])->save();
            Cache::forget($key);
            $this->audit->write($user, 'account_locked', User::class, $user->id, [
                'locked_minutes' => self::LOCK_MINUTES,
            ], $request);
        }
    }

    public function reset(User $user): void
    {
        Cache::forget($this->windowKey($user));
        $user->forceFill([
            'failed_login_count' => 0,
            'locked_until' => null,
        ])->save();
    }

    private function windowKey(User $user): string
    {
        return 'admin-login-failures:'.$user->id;
    }
}
