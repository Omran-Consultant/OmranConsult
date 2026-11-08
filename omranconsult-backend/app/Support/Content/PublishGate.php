<?php

namespace App\Support\Content;

use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\Projects\Infrastructure\Models\Project;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

final class PublishGate
{
    /**
     * @param  array<string, mixed>  $payload
     * @return list<string>
     */
    public function blockers(Model $subject, array $payload): array
    {
        $blockers = $this->disputeBlockers($subject);

        if ($subject instanceof Project) {
            $blockers = array_merge($blockers, $this->projectBlockers($payload));
        }

        return $blockers;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function assertCanPublish(Model $subject, array $payload): void
    {
        $blockers = $this->blockers($subject, $payload);
        if ($blockers === []) {
            return;
        }

        $errors = [];
        foreach ($blockers as $code) {
            $field = str_replace(['_required', '_blocks_publish'], '', $code);
            $errors[$field][] = $code;
        }

        throw ValidationException::withMessages($errors);
    }

    /**
     * @return list<string>
     */
    private function disputeBlockers(Model $subject): array
    {
        $blocked = ContentDispute::query()
            ->where('subject_type', $subject->getMorphClass())
            ->where('subject_id', $subject->getKey())
            ->where('blocks_publish', true)
            ->whereIn('status', ['pending', 'rejected'])
            ->exists();

        return $blocked ? ['dispute_blocks_publish'] : [];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<string>
     */
    private function projectBlockers(array $payload): array
    {
        $blockers = [];
        if (! $this->localeFilled($payload['title'] ?? null)) {
            $blockers[] = 'title_required';
        }
        if (! filled($payload['slug'] ?? null)) {
            $blockers[] = 'slug_required';
        }
        if (! filled($payload['client_id'] ?? null)) {
            $blockers[] = 'client_required';
        }
        if (! filled($payload['sector_id'] ?? null)) {
            $blockers[] = 'sector_required';
        }
        if (! $this->localeFilled($payload['overview'] ?? null)) {
            $blockers[] = 'overview_required';
        }
        $gallery = $payload['gallery'] ?? [];
        if (! is_array($gallery) || $gallery === []) {
            $blockers[] = 'cover_required';
        }

        return $blockers;
    }

    private function localeFilled(mixed $value): bool
    {
        if (! is_array($value)) {
            return false;
        }

        foreach (PublicLocale::SUPPORTED as $locale) {
            if (! filled($value[$locale] ?? null)) {
                return false;
            }
        }

        return true;
    }
}
