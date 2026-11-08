<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Support\Audit\AuditLogger;
use App\Support\Auth\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MfaSetupController extends Controller
{
    public function __construct(
        private readonly TotpService $totp,
        private readonly AuditLogger $audit,
    ) {}

    public function start(Request $request): JsonResponse
    {
        $user = $request->user();
        $secret = $this->totp->generateSecret();
        $request->session()->put('admin_mfa_setup_secret', $secret);

        return response()->json([
            'secret' => $secret,
            'qr_svg' => $this->totp->qrSvg($user->email, $secret),
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $secret = $request->session()->get('admin_mfa_setup_secret');
        $user = $request->user();

        if (! is_string($secret) || ! $this->totp->verify($secret, $validated['code'], $user, consume: false)) {
            throw ValidationException::withMessages([
                'code' => ['invalid_mfa_code'],
            ]);
        }

        $plain = $this->totp->plainRecoveryCodes();
        $user->forceFill([
            'mfa_secret' => $secret,
            'mfa_recovery_codes' => $this->totp->hashRecoveryCodes($plain),
            'mfa_enabled_at' => now(),
        ])->save();
        $request->session()->forget('admin_mfa_setup_secret');
        $this->audit->write($user, 'mfa_enabled', $user::class, $user->id, null, $request);

        return response()->json([
            'recovery_codes' => $plain,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string'],
            'code' => ['required', 'string'],
        ]);

        $user = $request->user();
        if (! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => [__('auth.failed')],
            ]);
        }

        if (! $user->mfaIsEnabled() || ! $this->totp->verify((string) $user->mfa_secret, $validated['code'], $user, consume: false)) {
            throw ValidationException::withMessages([
                'code' => ['invalid_mfa_code'],
            ]);
        }

        $user->forceFill([
            'mfa_secret' => null,
            'mfa_recovery_codes' => null,
            'mfa_enabled_at' => null,
        ])->save();
        $this->audit->write($user, 'mfa_disabled', $user::class, $user->id, null, $request);

        return response()->json(['message' => 'MFA disabled.']);
    }
}
