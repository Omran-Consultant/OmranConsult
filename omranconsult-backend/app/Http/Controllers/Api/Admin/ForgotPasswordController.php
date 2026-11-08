<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(['email' => $validated['email']]);

        $user = User::query()->where('email', $validated['email'])->first();
        if ($user !== null && $status === Password::RESET_LINK_SENT) {
            $this->audit->write($user, 'password_reset_requested', User::class, $user->id, null, $request);
        }

        return response()->json([
            'message' => 'If the account exists, a reset link was sent.',
        ]);
    }
}
