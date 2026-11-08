<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Admin\AdminUserResource;
use App\Support\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'department' => ['sometimes', 'nullable', 'string', 'max:80'],
            'dashboard_locale' => ['sometimes', 'nullable', 'in:ar,en'],
            'notify_inquiries' => ['sometimes', 'boolean'],
            'current_password' => ['required_with:password', 'string'],
            'password' => ['sometimes', 'string', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        if (isset($validated['password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => [__('auth.failed')],
                ]);
            }
            $user->password = $validated['password'];
            DB::table('sessions')->where('user_id', $user->id)->where('id', '!=', $request->session()->getId())->delete();
            Auth::guard('web')->logoutOtherDevices($validated['password']);
        }

        $user->fill(collect($validated)->only(['name', 'department', 'dashboard_locale', 'notify_inquiries'])->all());
        $user->save();
        $this->audit->write($user, 'profile_updated', $user::class, $user->id, collect($validated)->except(['password', 'current_password', 'password_confirmation'])->all(), $request);

        return response()->json([
            'user' => AdminUserResource::make($user->fresh())->resolve(),
        ]);
    }
}
