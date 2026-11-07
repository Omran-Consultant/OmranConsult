<?php

namespace Database\Seeders\Profile;

use App\Modules\Content\Infrastructure\Models\ContentDispute;
use App\Support\Content\PublicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Shared helpers for Corporate Profile 2029 demo content (SDD §6.6, A25).
 *
 * Arabic is the profile text as printed (docs/PROFILE_INVENTORY.md §3), errors included.
 * English is Claude's translation, not yet reviewed by the company (A17, A25).
 */
abstract class ProfileSeeder extends Seeder
{
    /**
     * @return array{ar: string|null, en: string|null}
     */
    protected static function t(?string $ar, ?string $en): array
    {
        return ['ar' => $ar, 'en' => $en];
    }

    /**
     * Pending editorial note that does not hide content (A26).
     *
     * @param  Model|class-string<Model>|null  $subject  a row, a whole collection (class name), or the whole site (null)
     * @param  array<string, mixed>  $snapshot
     */
    protected static function dispute(Model|string|null $subject, ?string $fieldPath, string $issueCode, string $description, array $snapshot = []): void
    {
        ContentDispute::create([
            'dispute_class' => 'editorial',
            'subject_type' => $subject instanceof Model ? $subject->getMorphClass() : $subject,
            'subject_id' => $subject instanceof Model ? $subject->getKey() : null,
            'field_path' => $fieldPath,
            'issue_code' => $issueCode,
            'description' => $description,
            'reference_snapshot' => $snapshot,
            'status' => 'pending',
        ]);
    }

    /**
     * @return array{status: string, published_at: Carbon}
     */
    protected static function published(): array
    {
        return [
            'status' => PublicationStatus::Published->value,
            'published_at' => now(),
        ];
    }
}
