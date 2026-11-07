<?php

namespace Database\Seeders\Profile;

use App\Support\Content\PublicationStatus;
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
