<?php

namespace App\Console\Commands;

use App\Modules\Media\Infrastructure\Models\Media;
use App\Modules\Projects\Application\ProjectGallery;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

class ImportSiteImagesCommand extends Command
{
    protected $signature = 'media:import-site-images {--path=}';

    protected $description = 'Create media rows from frontend public/images without moving files.';

    public function handle(): int
    {
        $root = $this->option('path') ?: dirname(base_path()).'/omranconsult-frontend/public/images';
        if (! is_dir($root)) {
            $this->components->error('Images directory not found: '.$root);

            return self::FAILURE;
        }

        $created = 0;
        $skipped = 0;
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root));

        /** @var SplFileInfo $file */
        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $relative = 'images/'.ltrim(Str::after($file->getPathname(), rtrim($root, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR), '/');
            $relative = str_replace('\\', '/', $relative);
            $ext = strtolower($file->getExtension());
            if (in_array($ext, ['svg', 'svgz'], true)) {
                continue;
            }

            if (Media::query()->where('import_key', $relative)->exists()) {
                $skipped++;

                continue;
            }

            $mime = mime_content_type($file->getPathname()) ?: 'application/octet-stream';
            $size = $file->getSize();
            $width = null;
            $height = null;
            if (str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml') {
                $info = @getimagesize($file->getPathname());
                if (is_array($info)) {
                    $width = $info[0];
                    $height = $info[1];
                }
            }

            Media::query()->create([
                'disk' => 'site',
                'path' => $relative,
                'filename' => $file->getFilename(),
                'original_filename' => $file->getFilename(),
                'mime_type' => $mime,
                'size_bytes' => $size,
                'width' => $width,
                'height' => $height,
                'import_key' => $relative,
            ]);
            $created++;
        }

        $linked = ProjectGallery::linkAll();
        $this->components->info("Imported {$created} files, skipped {$skipped} existing keys. Linked {$linked} project galleries.");

        return self::SUCCESS;
    }
}
