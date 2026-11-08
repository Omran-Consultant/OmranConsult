<?php

namespace App\Support\Content;

use App\Models\User;
use App\Modules\Content\Infrastructure\Models\PreviewToken;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

final class PreviewTokenService
{
    public function issue(User $user, Model $subject, string $path): array
    {
        $plain = Str::lower(Str::random(48));

        PreviewToken::query()->create([
            'user_id' => $user->id,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => $subject->getKey(),
            'token_hash' => hash('sha256', $plain),
            'path' => $path,
            'expires_at' => now()->addMinutes(15),
        ]);

        return [
            'token' => $plain,
            'path' => $path,
            'expires_at' => now()->addMinutes(15)->toIso8601String(),
        ];
    }

    public function findValid(string $plain): ?PreviewToken
    {
        $row = PreviewToken::query()->where('token_hash', hash('sha256', $plain))->first();
        if ($row === null || $row->isExpired()) {
            return null;
        }

        return $row;
    }

    public function matches(PreviewToken $token, Model $subject): bool
    {
        return $token->subject_type === $subject->getMorphClass()
            && (int) $token->subject_id === (int) $subject->getKey();
    }
}
