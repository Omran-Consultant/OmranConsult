<?php

namespace Database\Seeders\Demo;

use App\Modules\Content\Infrastructure\Models\ContentDraft;
use App\Modules\Projects\Application\ProjectGallery;
use App\Modules\Projects\Infrastructure\Models\Project;
use App\Modules\Projects\Infrastructure\Models\Region;
use App\Support\Content\ContentBlocks;
use App\Support\Content\SiteImageAlts;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

/**
 * Fills the empty fields of the profile projects with demo text (docs/briefs/DEMO_PROJECTS.md).
 * The text goes into the normal fields, a field that holds a value is never touched, and a project
 * with an unpublished dashboard draft is skipped. Year and delivery status are never invented.
 */
class DemoProjectContentSeeder extends Seeder
{
    public function run(): void
    {
        /** @var array<string, array<string, mixed>> $content */
        $content = require __DIR__.'/demo-projects.php';
        $regions = Region::query()->pluck('id', 'slug');

        Project::query()
            ->with('regions')
            ->whereIn('slug', array_keys($content))
            ->get()
            ->each(fn (Project $project) => $this->fill($project, $content[$project->slug], $regions));
    }

    /**
     * @param  array<string, mixed>  $demo
     * @param  Collection<string, int>  $regions
     */
    private function fill(Project $project, array $demo, Collection $regions): void
    {
        if ($this->hasDraft($project)) {
            return;
        }

        $attributes = [];

        if (! $this->hasBlocks($project->overview)) {
            $attributes['overview'] = ContentBlocks::validateLocaleMap([
                'ar' => array_map($this->paragraph(...), $demo['overview']['ar']),
                'en' => array_map($this->paragraph(...), $demo['overview']['en']),
            ], 'overview');
        }

        if (! $this->hasText($project->scope)) {
            $attributes['scope'] = $demo['scope'];
        }

        foreach (['location', 'service_type'] as $field) {
            if ($demo[$field] !== null && ! $this->hasText($project->getAttribute($field))) {
                $attributes[$field] = $demo[$field];
            }
        }

        $gallery = ProjectGallery::stored($project->gallery);
        if (count($gallery) < 2) {
            $attributes['gallery'] = $this->withDemoImages($gallery, $demo['gallery']);
        }

        $regionIds = $project->regions->isEmpty()
            ? array_map(fn (string $slug): int => $regions[$slug], $demo['regions'])
            : [];

        if ($attributes === [] && $regionIds === []) {
            return;
        }

        $project->forceFill([...$attributes, 'has_demo_content' => true])->save();
        if ($regionIds !== []) {
            $project->regions()->sync($regionIds);
        }
        ProjectGallery::linkProject($project);
    }

    private function hasDraft(Project $project): bool
    {
        return ContentDraft::query()
            ->where('subject_type', $project->getMorphClass())
            ->where('subject_id', $project->getKey())
            ->exists();
    }

    private function hasBlocks(mixed $overview): bool
    {
        $map = is_array($overview) ? $overview : [];

        return ContentBlocks::coerce($map['ar'] ?? null) !== [] || ContentBlocks::coerce($map['en'] ?? null) !== [];
    }

    private function hasText(mixed $value): bool
    {
        return collect(is_array($value) ? $value : [])
            ->flatten()
            ->contains(fn (mixed $text): bool => is_string($text) && trim($text) !== '');
    }

    /**
     * @return array<string, mixed>
     */
    private function paragraph(string $text): array
    {
        return ['type' => 'paragraph', 'children' => [['text' => $text]]];
    }

    /**
     * @param  list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>  $gallery
     * @param  list<string>  $keys
     * @return list<array{key: ?string, media_id: ?int, alt: array{ar: string, en: string}}>
     */
    private function withDemoImages(array $gallery, array $keys): array
    {
        foreach (array_diff($keys, array_column($gallery, 'key')) as $key) {
            $gallery[] = [
                'key' => $key,
                'media_id' => null,
                'alt' => SiteImageAlts::for($key) ?? ['ar' => '', 'en' => ''],
            ];
        }

        return $gallery;
    }
}
