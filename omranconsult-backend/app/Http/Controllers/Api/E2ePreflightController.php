<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class E2ePreflightController extends Controller
{
    public function __invoke(): JsonResponse
    {
        if (! app()->environment('local', 'testing')) {
            abort(404);
        }

        $database = 'unknown';
        try {
            DB::connection()->getPdo();
            $database = 'ok';
        } catch (\Throwable) {
            $database = 'failed';
        }

        return response()->json([
            'status' => $database === 'ok' ? 'ok' : 'degraded',
            'database' => $database,
            'queue' => config('queue.default'),
        ]);
    }
}
