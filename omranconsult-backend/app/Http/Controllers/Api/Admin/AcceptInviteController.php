<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Admin\AdminUserResource;
use App\Models\User;
use App\Modules\Users\Infrastructure\Models\UserInvitation;
use App\Support\Audit\AuditLogger;
use App\Support\Auth\PasswordPolicy;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AcceptInviteController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'confirmed', PasswordPolicy::rule()],
            'name' => ['sometimes', 'string', 'max:120'],
        ]);

        $email = strtolower($validated['email']);
        $invite = UserInvitation::query()
            ->where('token_hash', hash('sha256', $validated['token']))
            ->whereRaw('lower(email) = ?', [$email])
            ->first();

        if ($invite === null || ! $invite->isPending()) {
            throw ValidationException::withMessages(['token' => ['invite_invalid']]);
        }

        if (User::query()->whereRaw('lower(email) = ?', [$email])->exists()) {
            throw ValidationException::withMessages(['email' => ['email_taken']]);
        }

        $role = $invite->role === EditorRole::NAME ? EditorRole::NAME : SuperAdminRole::NAME;
        $user = User::query()->create([
            'name' => $validated['name'] ?? $invite->name,
            'email' => $email,
            'password' => $validated['password'],
            'is_active' => true,
        ]);
        $user->assignRole($role);
        $invite->forceFill(['accepted_at' => now()])->save();
        $this->audit->write($user, 'invite_accepted', User::class, $user->id, ['role' => $role], $request);

        return response()->json([
            'message' => 'Invitation accepted.',
            'user' => AdminUserResource::make($user->fresh())->resolve($request),
        ]);
    }
}
