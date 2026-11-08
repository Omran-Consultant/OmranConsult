<?php

namespace App\Modules\Users\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Admin\AdminUserResource;
use App\Models\User;
use App\Modules\Users\Infrastructure\Models\UserInvitation;
use App\Notifications\UserInvitationNotification;
use App\Support\Audit\AuditLogger;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminUsersController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));

        $users = User::query()
            ->with('roles')
            ->when($search !== '', fn ($query) => $query->where(function ($inner) use ($search): void {
                $inner->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            }))
            ->orderBy('name')
            ->get();

        $invites = UserInvitation::query()
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $users->map(fn (User $user): array => AdminUserResource::make($user)->resolve($request))->values(),
            'invitations' => $invites->map(fn (UserInvitation $invite): array => [
                'id' => $invite->id,
                'name' => $invite->name,
                'email' => $invite->email,
                'role' => $invite->role,
                'expires_at' => $invite->expires_at->toIso8601String(),
                'status' => $invite->isPending() ? 'pending' : 'expired',
            ])->values(),
            'role_counts' => [
                SuperAdminRole::NAME => User::role(SuperAdminRole::NAME)->where('is_active', true)->count(),
                EditorRole::NAME => User::role(EditorRole::NAME)->where('is_active', true)->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', Rule::in([SuperAdminRole::NAME, EditorRole::NAME])],
        ]);

        $email = strtolower($validated['email']);
        if (User::query()->whereRaw('lower(email) = ?', [$email])->exists()) {
            throw ValidationException::withMessages(['email' => ['email_taken']]);
        }

        $plain = Str::lower(Str::random(48));
        $invite = UserInvitation::query()->create([
            'name' => $validated['name'],
            'email' => $email,
            'role' => $validated['role'],
            'token_hash' => hash('sha256', $plain),
            'invited_by' => $request->user()?->id,
            'expires_at' => now()->addHours(72),
        ]);

        (new AnonymousNotifiable)->route('mail', $email)->notify(new UserInvitationNotification($plain));
        $this->audit->write($request->user(), 'user_invited', UserInvitation::class, $invite->id, [
            'email' => $email,
            'role' => $validated['role'],
        ], $request);

        return response()->json([
            'invitation' => [
                'id' => $invite->id,
                'email' => $invite->email,
                'role' => $invite->role,
                'expires_at' => $invite->expires_at->toIso8601String(),
            ],
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'department' => ['sometimes', 'nullable', 'string', 'max:80'],
            'role' => ['sometimes', Rule::in([SuperAdminRole::NAME, EditorRole::NAME])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($request->user()?->is($user) && (isset($validated['role']) || array_key_exists('is_active', $validated))) {
            throw ValidationException::withMessages(['user' => ['cannot_modify_self']]);
        }

        if (isset($validated['role']) || (array_key_exists('is_active', $validated) && $validated['is_active'] === false)) {
            $this->guardLastSuperAdmin($user, $validated);
        }

        $user->fill(collect($validated)->only(['name', 'department', 'is_active'])->all());
        $user->save();

        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        $this->audit->write($request->user(), 'user_updated', User::class, $user->id, collect($validated)->all(), $request);

        return response()->json([
            'user' => AdminUserResource::make($user->fresh())->resolve($request),
        ]);
    }

    public function resetMfa(Request $request, User $user): JsonResponse
    {
        $user->forceFill([
            'mfa_secret' => null,
            'mfa_recovery_codes' => null,
            'mfa_enabled_at' => null,
            'remember_token' => Str::random(60),
        ])->save();
        $this->audit->write($request->user(), 'mfa_reset', User::class, $user->id, null, $request);

        return response()->json(['message' => 'MFA reset.']);
    }

    public function revokeSessions(Request $request, User $user): JsonResponse
    {
        DB::table('sessions')->where('user_id', $user->id)->delete();
        $user->forceFill(['remember_token' => Str::random(60)])->save();
        $this->audit->write($request->user(), 'sessions_revoked', User::class, $user->id, null, $request);

        return response()->json(['message' => 'Sessions revoked.']);
    }

    public function resendInvite(Request $request, UserInvitation $invitation): JsonResponse
    {
        if ($invitation->accepted_at !== null || $invitation->revoked_at !== null) {
            throw ValidationException::withMessages(['invitation' => ['not_pending']]);
        }

        $plain = Str::lower(Str::random(48));
        $invitation->forceFill([
            'token_hash' => hash('sha256', $plain),
            'expires_at' => now()->addHours(72),
        ])->save();
        (new AnonymousNotifiable)->route('mail', $invitation->email)->notify(new UserInvitationNotification($plain));
        $this->audit->write($request->user(), 'user_invite_resent', UserInvitation::class, $invitation->id, null, $request);

        return response()->json(['message' => 'Invitation resent.']);
    }

    public function revokeInvite(Request $request, UserInvitation $invitation): JsonResponse
    {
        $invitation->forceFill(['revoked_at' => now()])->save();
        $this->audit->write($request->user(), 'user_invite_revoked', UserInvitation::class, $invitation->id, null, $request);

        return response()->json(['message' => 'Invitation cancelled.']);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function guardLastSuperAdmin(User $user, array $validated): void
    {
        if (! $user->hasRole(SuperAdminRole::NAME) || ! $user->is_active) {
            return;
        }

        $demoting = isset($validated['role']) && $validated['role'] !== SuperAdminRole::NAME;
        $deactivating = array_key_exists('is_active', $validated) && $validated['is_active'] === false;
        if (! $demoting && ! $deactivating) {
            return;
        }

        $other = User::role(SuperAdminRole::NAME)->where('is_active', true)->whereKeyNot($user->id)->exists();
        if (! $other) {
            throw ValidationException::withMessages(['user' => ['last_super_admin']]);
        }
    }
}
