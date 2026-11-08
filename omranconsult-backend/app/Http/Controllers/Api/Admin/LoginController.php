<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\LoginRequest;
use App\Http\Resources\Api\Admin\AdminUserResource;
use App\Models\User;
use App\Support\Audit\AuditLogger;
use App\Support\Auth\AccountLockout;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function __construct(
        private readonly AccountLockout $lockout,
        private readonly AuditLogger $audit,
    ) {}

    public function __invoke(LoginRequest $request): JsonResponse
    {
        $email = strtolower((string) $request->validated('email'));
        $password = (string) $request->validated('password');
        $remember = $request->boolean('remember');

        $user = User::query()->whereRaw('lower(email) = ?', [$email])->first();

        if ($user !== null && $this->lockout->isLocked($user)) {
            return $this->lockedResponse($user);
        }

        if ($user === null || ! Hash::check($password, $user->password)) {
            if ($user !== null) {
                $this->lockout->recordFailure($user, $request);
                if ($this->lockout->isLocked($user->fresh())) {
                    return $this->lockedResponse($user->fresh());
                }
            }

            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if (! $user->is_active || ! $user->hasDashboardRole()) {
            $this->audit->write($user, 'login_failed', User::class, $user->id, null, $request);

            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if ($user->mfaIsEnabled()) {
            $request->session()->put('admin_mfa', [
                'user_id' => $user->id,
                'remember' => $remember,
                'expires_at' => now()->addMinutes(5)->getTimestamp(),
            ]);

            return response()->json([
                'mfa_required' => true,
            ]);
        }

        Auth::guard('web')->login($user, $remember);
        $request->session()->regenerate();
        $this->lockout->reset($user);
        $user->forceFill(['last_login_at' => now()])->save();
        $this->audit->write($user, 'login_succeeded', User::class, $user->id, null, $request);

        return response()->json([
            'user' => AdminUserResource::make($user->fresh())->resolve(),
        ]);
    }

    private function lockedResponse(User $user): JsonResponse
    {
        return response()->json([
            'message' => 'account_locked',
            'minutes_remaining' => $this->lockout->minutesRemaining($user),
        ], 423);
    }
}
