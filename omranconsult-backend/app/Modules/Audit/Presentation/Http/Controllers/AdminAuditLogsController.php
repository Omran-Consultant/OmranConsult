<?php

namespace App\Modules\Audit\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Audit\Infrastructure\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuditLogsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user' => ['sometimes', 'integer'],
            'action' => ['sometimes', 'string', 'max:64'],
            'subject_type' => ['sometimes', 'string', 'max:128'],
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $logs = AuditLog::query()
            ->with('user:id,name,email')
            ->when(isset($validated['user']), fn ($query) => $query->where('user_id', $validated['user']))
            ->when(isset($validated['action']), fn ($query) => $query->where('action', $validated['action']))
            ->when(isset($validated['subject_type']), fn ($query) => $query->where('subject_type', $validated['subject_type']))
            ->when(isset($validated['from']), fn ($query) => $query->where('occurred_at', '>=', $validated['from']))
            ->when(isset($validated['to']), fn ($query) => $query->where('occurred_at', '<=', $validated['to']))
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->paginate((int) ($validated['per_page'] ?? 30));

        return response()->json([
            'data' => collect($logs->items())->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'changes' => $log->changes,
                'occurred_at' => $log->occurred_at?->toIso8601String(),
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                ] : null,
            ])->values(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
