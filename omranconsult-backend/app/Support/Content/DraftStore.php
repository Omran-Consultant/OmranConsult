<?php

namespace App\Support\Content;

use App\Models\User;
use App\Modules\Content\Infrastructure\Models\ContentDraft;
use Illuminate\Database\Eloquent\Model;

final class DraftStore
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function put(Model $subject, array $payload, User $author): ContentDraft
    {
        return ContentDraft::query()->updateOrCreate(
            [
                'subject_type' => $subject->getMorphClass(),
                'subject_id' => $subject->getKey(),
            ],
            [
                'payload' => $payload,
                'author_id' => $author->id,
            ],
        );
    }

    public function find(Model $subject): ?ContentDraft
    {
        return ContentDraft::query()
            ->where('subject_type', $subject->getMorphClass())
            ->where('subject_id', $subject->getKey())
            ->first();
    }

    public function discard(Model $subject): void
    {
        ContentDraft::query()
            ->where('subject_type', $subject->getMorphClass())
            ->where('subject_id', $subject->getKey())
            ->delete();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function apply(Model $subject, array $payload): Model
    {
        $fillable = array_intersect_key($payload, array_flip($subject->getFillable()));
        $subject->fill($fillable);
        $subject->save();

        if (array_key_exists('region_ids', $payload) && method_exists($subject, 'regions')) {
            $subject->regions()->sync(array_values(array_filter((array) $payload['region_ids'], 'is_numeric')));
        }

        return $subject->fresh() ?? $subject;
    }
}
