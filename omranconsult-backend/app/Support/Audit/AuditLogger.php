<?php

namespace App\Support\Audit;

use App\Models\User;
use App\Modules\Audit\Infrastructure\Models\AuditLog;
use App\Support\IpHash;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class AuditLogger
{
    /**
     * @param  array<string, mixed>|null  $changes
     */
    public function write(
        ?User $actor,
        string $action,
        ?string $subjectType,
        ?int $subjectId,
        ?array $changes,
        ?Request $request = null,
    ): AuditLog {
        $request ??= request();
        $agent = (string) $request->userAgent();

        return AuditLog::query()->create([
            'user_id' => $actor?->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'changes' => $this->redact($changes),
            'ip_hash' => IpHash::make($request->ip()),
            'user_agent' => Str::limit($agent, 255, ''),
            'occurred_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>|null  $changes
     * @return array<string, mixed>|null
     */
    private function redact(?array $changes): ?array
    {
        if ($changes === null) {
            return null;
        }

        $blocked = ['password', 'token', 'secret', 'mfa_secret', 'mfa_recovery_codes', 'remember_token', 'message'];

        return collect($changes)
            ->reject(fn (mixed $value, mixed $key): bool => in_array((string) $key, $blocked, true)
                || Str::contains((string) $key, ['password', 'token', 'secret', 'recovery']))
            ->all();
    }
}
