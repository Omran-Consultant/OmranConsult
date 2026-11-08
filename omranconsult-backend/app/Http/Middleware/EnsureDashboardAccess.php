<?php

namespace App\Http\Middleware;

use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureDashboardAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        if (! $user->is_active) {
            abort(403);
        }

        if (! $user->hasAnyRole([SuperAdminRole::NAME, EditorRole::NAME])) {
            abort(403);
        }

        return $next($request);
    }
}
