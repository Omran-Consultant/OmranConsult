<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\LoginRequest;
use App\Http\Resources\Api\Admin\AdminUserResource;
use App\Support\SuperAdminRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $credentials = $request->safe()->only(['email', 'password']);

        if (! Auth::guard('web')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $user = Auth::guard('web')->user();

        if (! $user->hasRole(SuperAdminRole::NAME)) {
            Auth::guard('web')->logout();

            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => AdminUserResource::make($user)->resolve(),
        ]);
    }
}
