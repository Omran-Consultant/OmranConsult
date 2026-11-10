<?php

namespace App\Support\Content;

use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Modules\News\Infrastructure\Models\NewsPost;
use App\Modules\Projects\Application\ProjectGallery;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Services\Infrastructure\Models\Service;
use App\Modules\Services\Infrastructure\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

final class PublishGate
{
    /**
     * @param  array<string, mixed>  $payload
     * @return list<array{field: string, code: string}>
     */
    public function blockers(Model $subject, array $payload): array
    {
        $blockers = $this->disputeBlockers($subject);

        if ($subject instanceof Project) {
            $blockers = array_merge($blockers, $this->projectBlockers($payload));
        }
        if ($subject instanceof ServiceCategory || $subject instanceof Service) {
            $blockers = array_merge($blockers, $this->serviceBlockers($payload, $subject instanceof ServiceCategory));
        }
        if ($subject instanceof NewsPost) {
            $blockers = array_merge($blockers, $this->newsBlockers($payload));
        }

        $unique = [];
        foreach ($blockers as $blocker) {
            $unique[$blocker['field'].'|'.$blocker['code']] = $blocker;
        }

        return array_values($unique);
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
        foreach ($blockers as $blocker) {
            $errors[$blocker['field']][] = $blocker['code'];
        }

        throw ValidationException::withMessages($errors);
    }

    /**
     * @return list<array{field: string, code: string}>
     */
    private function disputeBlockers(Model $subject): array
    {
        $blocked = ContentDispute::query()
            ->where('subject_type', $subject->getMorphClass())
            ->where('subject_id', $subject->getKey())
            ->where('blocks_publish', true)
            ->whereIn('status', ['pending', 'rejected'])
            ->exists();

        return $blocked ? [['field' => 'dispute', 'code' => 'dispute_blocks_publish']] : [];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<array{field: string, code: string}>
     */
    private function projectBlockers(array $payload): array
    {
        $blockers = [];
        foreach (PublicLocale::SUPPORTED as $locale) {
            $title = is_array($payload['title'] ?? null) ? ($payload['title'][$locale] ?? null) : null;
            if (! is_string($title) || trim($title) === '') {
                $blockers[] = ['field' => 'title.'.$locale, 'code' => 'title_'.$locale.'_required'];
            }

            $overview = is_array($payload['overview'] ?? null) ? ($payload['overview'][$locale] ?? null) : null;
            $blocks = ContentBlocks::coerce($overview);
            if (! ContentBlocks::hasVisibleText($blocks)) {
                $blockers[] = ['field' => 'overview.'.$locale, 'code' => 'overview_'.$locale.'_required'];
            }
        }

        if (! filled($payload['slug'] ?? null)) {
            $blockers[] = ['field' => 'slug', 'code' => 'slug_required'];
        }
        if (! filled($payload['client_id'] ?? null)) {
            $blockers[] = ['field' => 'client_id', 'code' => 'client_required'];
        }
        if (! filled($payload['sector_id'] ?? null)) {
            $blockers[] = ['field' => 'sector_id', 'code' => 'sector_required'];
        }

        foreach (ProjectGallery::coverBlockers(ProjectGallery::stored($payload['gallery'] ?? [])) as $code) {
            $blockers[] = ['field' => 'gallery', 'code' => $code];
        }

        return $blockers;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<array{field: string, code: string}>
     */
    private function serviceBlockers(array $payload, bool $isCategory): array
    {
        $blockers = [];
        foreach (PublicLocale::SUPPORTED as $locale) {
            $title = is_array($payload['title'] ?? null) ? ($payload['title'][$locale] ?? null) : null;
            if (! is_string($title) || trim($title) === '') {
                $blockers[] = ['field' => 'title.'.$locale, 'code' => 'title_'.$locale.'_required'];
            }
        }
        if (! filled($payload['slug'] ?? null)) {
            $blockers[] = ['field' => 'slug', 'code' => 'slug_required'];
        }
        if ($isCategory && ! filled($payload['kind'] ?? null)) {
            $blockers[] = ['field' => 'kind', 'code' => 'kind_required'];
        }
        if (! $isCategory && ! filled($payload['category_id'] ?? null)) {
            $blockers[] = ['field' => 'category_id', 'code' => 'category_required'];
        }

        return $blockers;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<array{field: string, code: string}>
     */
    private function newsBlockers(array $payload): array
    {
        $blockers = [];
        foreach (PublicLocale::SUPPORTED as $locale) {
            foreach (['title', 'excerpt'] as $field) {
                $value = is_array($payload[$field] ?? null) ? ($payload[$field][$locale] ?? null) : null;
                if (! is_string($value) || trim($value) === '') {
                    $blockers[] = ['field' => $field.'.'.$locale, 'code' => $field.'_'.$locale.'_required'];
                }
            }
            $body = is_array($payload['body'] ?? null) ? ($payload['body'][$locale] ?? null) : null;
            $blocks = ContentBlocks::coerce($body);
            if (! ContentBlocks::hasVisibleText($blocks)) {
                $blockers[] = ['field' => 'body.'.$locale, 'code' => 'body_'.$locale.'_required'];
            }
        }
        if (! filled($payload['slug'] ?? null)) {
            $blockers[] = ['field' => 'slug', 'code' => 'slug_required'];
        }
        if (! filled($payload['news_category_id'] ?? null)) {
            $blockers[] = ['field' => 'news_category_id', 'code' => 'category_required'];
        }
        if (! filled($payload['published_at'] ?? null)) {
            $blockers[] = ['field' => 'published_at', 'code' => 'published_at_required'];
        }

        $coverMediaId = $payload['cover_media_id'] ?? null;
        $coverKey = $payload['cover_image'] ?? null;
        if (! filled($coverMediaId) && ! filled($coverKey)) {
            $blockers[] = ['field' => 'cover', 'code' => 'cover_required'];
        }

        return $blockers;
    }
}
