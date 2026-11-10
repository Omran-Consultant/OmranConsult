<?php

namespace App\Modules\Projects\Application;

use App\Modules\Media\Application\MediaUrls;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Media\Infrastructure\Models\MediaReference;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Support\Content\PublicLocale;
use App\Support\Content\SiteImageAlts;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

final class ProjectGallery
{
    /**
     * @return list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>
     */
    public static function normalize(mixed $gallery): array
    {
        if ($gallery === null) {
            return [];
        }

        if (! is_array($gallery)) {
            throw ValidationException::withMessages(['gallery' => ['invalid_gallery']]);
        }

        $items = [];
        foreach (array_values($gallery) as $item) {
            if (is_string($item)) {
                if ($item === '') {
                    continue;
                }
                $items[] = self::item($item, null, ['ar' => '', 'en' => '']);

                continue;
            }

            if (! is_array($item)) {
                throw ValidationException::withMessages(['gallery' => ['invalid_gallery']]);
            }

            $allowed = ['key', 'media_id', 'alt', 'url', 'srcset', 'width', 'height'];
            if (array_diff(array_keys($item), $allowed) !== []) {
                throw ValidationException::withMessages(['gallery' => ['invalid_gallery']]);
            }

            $key = $item['key'] ?? null;
            if ($key !== null && ! is_string($key)) {
                throw ValidationException::withMessages(['gallery' => ['invalid_gallery']]);
            }

            $mediaId = $item['media_id'] ?? null;
            if ($mediaId !== null && ! is_int($mediaId)) {
                throw ValidationException::withMessages(['gallery' => ['invalid_gallery']]);
            }

            $alt = self::alt($item['alt'] ?? null);
            if (($key === null || $key === '') && $mediaId === null) {
                continue;
            }

            $items[] = self::item($key === '' ? null : $key, $mediaId, $alt);
        }

        return $items;
    }

    /**
     * Attach imported site photos (Q19) without dropping the legacy key.
     */
    public static function linkAll(): int
    {
        $linked = 0;
        Project::withTrashed()->orderBy('id')->each(function (Project $project) use (&$linked): void {
            if (self::linkProject($project)) {
                $linked++;
            }
        });

        return $linked;
    }

    public static function linkProject(Project $project): bool
    {
        $items = self::stored($project->gallery);
        $changed = false;

        foreach ($items as $index => $item) {
            if ($item['media_id'] !== null || $item['key'] === null) {
                continue;
            }

            $media = Media::query()->where('import_key', 'images/site/'.$item['key'].'.jpg')->first();
            if ($media === null) {
                continue;
            }

            $items[$index]['media_id'] = $media->id;
            if ($items[$index]['alt']['ar'] === '' && $items[$index]['alt']['en'] === '') {
                $known = SiteImageAlts::for($item['key']);
                if ($known !== null) {
                    $items[$index]['alt'] = $known;
                }
            }
            $changed = true;
        }

        if (! $changed) {
            return false;
        }

        $project->gallery = $items;
        $project->save();
        self::syncReferences($project, $items, $project->og_image_media_id);

        return true;
    }

    /**
     * @param  list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>  $items
     */
    public static function syncReferences(Project $project, array $items, ?int $ogImageId): void
    {
        MediaReference::query()
            ->where('referencer_type', $project->getMorphClass())
            ->where('referencer_id', $project->getKey())
            ->whereIn('field', ['gallery', 'og_image'])
            ->delete();

        $ids = [];
        foreach ($items as $item) {
            if ($item['media_id'] !== null) {
                $ids[] = $item['media_id'];
            }
        }
        $ids = array_values(array_unique($ids));

        foreach ($ids as $id) {
            MediaReference::query()->create([
                'media_id' => $id,
                'referencer_type' => $project->getMorphClass(),
                'referencer_id' => $project->getKey(),
                'field' => 'gallery',
            ]);
        }

        if ($ogImageId !== null) {
            MediaReference::query()->create([
                'media_id' => $ogImageId,
                'referencer_type' => $project->getMorphClass(),
                'referencer_id' => $project->getKey(),
                'field' => 'og_image',
            ]);
        }
    }

    /**
     * @param  list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>  $items
     * @return list<array<string, mixed>>
     */
    public static function present(array $items, bool $bilingual): array
    {
        $media = self::mediaFor($items);

        return array_map(function (array $item) use ($bilingual, $media): array {
            $row = $item['media_id'] !== null ? $media->get($item['media_id']) : null;
            $presented = [
                'key' => $item['key'],
                'media_id' => $item['media_id'],
                'url' => $row instanceof Media ? MediaUrls::url($row) : null,
                'srcset' => $row instanceof Media ? MediaUrls::srcset($row) : null,
                'width' => $row?->width,
                'height' => $row?->height,
            ];

            if ($bilingual) {
                $presented['alt'] = $item['alt'];
            } else {
                $presented['alt'] = PublicLocale::pick($item['alt']);
            }

            return $presented;
        }, $items);
    }

    /**
     * @param  list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>  $items
     * @return array<string, mixed>|null
     */
    public static function cover(array $items): ?array
    {
        $first = self::present($items, false)[0] ?? null;

        return is_array($first) ? $first : null;
    }

    /**
     * Legacy readers and the publish gate both accept a bare key until alt text exists.
     *
     * @param  list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>  $items
     * @return list<string>
     */
    public static function coverBlockers(array $items): array
    {
        if ($items === []) {
            return ['cover_required'];
        }

        foreach ($items as $item) {
            if ($item['media_id'] === null && filled($item['key'])) {
                return [];
            }
        }

        foreach ($items as $item) {
            if ($item['media_id'] === null) {
                continue;
            }
            if (filled($item['alt']['ar']) && filled($item['alt']['en'])) {
                return [];
            }
        }

        return ['cover_alt_required'];
    }

    /**
     * @return list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>
     */
    public static function stored(mixed $gallery): array
    {
        try {
            return self::normalize($gallery);
        } catch (ValidationException) {
            return [];
        }
    }

    /**
     * @param  array{ar: string, en: string}|null  $alt
     * @return array{ar: string, en: string}
     */
    private static function alt(mixed $alt): array
    {
        if (! is_array($alt)) {
            return ['ar' => '', 'en' => ''];
        }

        return [
            'ar' => is_string($alt['ar'] ?? null) ? $alt['ar'] : '',
            'en' => is_string($alt['en'] ?? null) ? $alt['en'] : '',
        ];
    }

    /**
     * @param  array{ar: string, en: string}  $alt
     * @return array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}
     */
    private static function item(?string $key, ?int $mediaId, array $alt): array
    {
        return [
            'key' => $key,
            'media_id' => $mediaId,
            'alt' => $alt,
        ];
    }

    /**
     * @param  list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>  $items
     * @return Collection<int, Media>
     */
    private static function mediaFor(array $items): Collection
    {
        $ids = array_values(array_filter(array_map(
            fn (array $item): ?int => $item['media_id'],
            $items,
        )));

        if ($ids === []) {
            return collect();
        }

        return Media::query()->whereIn('id', $ids)->get()->keyBy('id');
    }
}
