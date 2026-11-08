<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Admin\AdminUserResource;
use App\Models\User;
use App\Support\Audit\AuditLogger;
use App\Support\Auth\AccountLockout;
use App\Support\Auth\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class MfaLoginController extends Controller
{
    public function __construct(
        private readonly TotpService $totp,
        private readonly AccountLockout $lockout,
        private readonly AuditLogger $audit,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $pending = $request->session()->get('admin_mfa');
        if (! is_array($pending) || now()->getTimestamp() > (int) ($pending['expires_at'] ?? 0)) {
            $request->session()->forget('admin_mfa');

            throw ValidationException::withMessages([
                'code' => ['mfa_expired'],
            ]);
        }

        $user = User::query()->find($pending['user_id']);
        if ($user === null) {
            $request->session()->forget('admin_mfa');

            throw ValidationException::withMessages([
                'code' => ['mfa_expired'],
            ]);
        }

        if ($this->lockout->isLocked($user)) {
            return response()->json([
                'message' => 'account_locked',
                'minutes_remaining' => $this->lockout->minutesRemaining($user),
            ], 423);
        }

        $validated = $request->validate([
            'code' => ['required_without:recovery_code', 'string'],
            'recovery_code' => ['required_without:code', 'string'],
        ]);

        $ok = false;
        if (isset($validated['recovery_code'])) {
            $remaining = $this->totp->consumeRecoveryCode(
                $user->mfa_recovery_codes ?? [],
                $validated['recovery_code'],
            );
            if ($remaining !== null) {
                $user->forceFill(['mfa_recovery_codes' => $remaining])->save();
                $ok = true;
            }
        } else {
            $ok = $this->totp->verify((string) $user->mfa_secret, $validated['code'], $user);
        }

        if (! $ok) {
            $this->lockout->recordFailure($user, $request);
            if ($this->lockout->isLocked($user->fresh())) {
                return response()->json([
                    'message' => 'account_locked',
                    'minutes_remaining' => $this->lockout->minutesRemaining($user->fresh()),
                ], 423);
            }

            throw ValidationException::withMessages([
                'code' => [__('auth.failed')],
            ]);
        }

        $request->session()->forget('admin_mfa');
        Auth::guard('web')->login($user, (bool) ($pending['remember'] ?? false));
        $request->session()->regenerate();
        $this->lockout->reset($user);
        $user->forceFill(['last_login_at' => now()])->save();
        $this->audit->write($user, 'login_succeeded', User::class, $user->id, ['mfa' => true], $request);

        return response()->json([
            'user' => AdminUserResource::make($user->fresh())->resolve(),
        ]);
    }
}
