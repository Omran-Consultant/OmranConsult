<?php

namespace App\Modules\Media\Application;

use App\Models\User;
use App\Modules\Media\Infrastructure\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

final class MediaUploader
{
    private const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

    private const PDF_MAX_BYTES = 20 * 1024 * 1024;

    private const MAX_EDGE = 8000;

    /** @var list<int> */
    private const WIDTHS = [400, 800, 1600];

    public function store(UploadedFile $file, User $user): Media
    {
        $this->assertSafe($file);

        $mime = $this->realMime($file);
        $isPdf = $mime === 'application/pdf';
        $isImage = str_starts_with($mime, 'image/');

        if (! $isPdf && ! $isImage) {
            throw ValidationException::withMessages(['file' => ['unsupported_type']]);
        }

        if ($isPdf && $file->getSize() > self::PDF_MAX_BYTES) {
            throw ValidationException::withMessages(['file' => ['pdf_too_large']]);
        }

        if ($isImage && $file->getSize() > self::IMAGE_MAX_BYTES) {
            throw ValidationException::withMessages(['file' => ['image_too_large']]);
        }

        $random = Str::lower(Str::random(40));

        if ($isPdf) {
            $filename = $random.'.pdf';
            $path = $file->storeAs('media', $filename, 'public');

            return Media::query()->create([
                'disk' => 'public',
                'path' => $path,
                'filename' => $filename,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $mime,
                'size_bytes' => $file->getSize(),
                'created_by' => $user->id,
            ]);
        }

        return $this->storeImage($file, $user, $random, $mime);
    }

    private function storeImage(UploadedFile $file, User $user, string $random, string $mime): Media
    {
        $manager = ImageManager::usingDriver(Driver::class);
        $image = $manager->decodePath((string) $file->getRealPath());
        if (count($image) > 1) {
            throw ValidationException::withMessages(['file' => ['animated_not_allowed']]);
        }

        $width = $image->width();
        $height = $image->height();

        if ($width > self::MAX_EDGE || $height > self::MAX_EDGE) {
            throw ValidationException::withMessages(['file' => ['dimensions_too_large']]);
        }

        $filename = $random.'.webp';
        $originalPath = 'media/'.$filename;
        $encoded = (string) $image->encodeUsingFormat(Format::WEBP, quality: 82);
        Storage::disk('public')->put($originalPath, $encoded);

        $variants = [];
        foreach (self::WIDTHS as $target) {
            if ($width <= $target) {
                continue;
            }
            $variantName = $random.'-'.$target.'.webp';
            $resized = $manager->decodePath((string) $file->getRealPath())->scale(width: $target);
            Storage::disk('public')->put(
                'media/'.$variantName,
                (string) $resized->encodeUsingFormat(Format::WEBP, quality: 80),
            );
            $variants[(string) $target] = 'media/'.$variantName;
        }

        return Media::query()->create([
            'disk' => 'public',
            'path' => $originalPath,
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => 'image/webp',
            'size_bytes' => strlen($encoded),
            'width' => $width,
            'height' => $height,
            'variants' => $variants,
            'created_by' => $user->id,
        ]);
    }

    private function assertSafe(UploadedFile $file): void
    {
        $original = strtolower((string) $file->getClientOriginalExtension());
        if (in_array($original, ['svg', 'svgz'], true)) {
            throw ValidationException::withMessages(['file' => ['svg_not_allowed']]);
        }

        $mime = $this->realMime($file);
        if (str_contains($mime, 'svg')) {
            throw ValidationException::withMessages(['file' => ['svg_not_allowed']]);
        }

        if ($this->isAnimated($file, $mime)) {
            throw ValidationException::withMessages(['file' => ['animated_not_allowed']]);
        }
    }

    private function realMime(UploadedFile $file): string
    {
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $detected = $finfo->file($file->getRealPath()) ?: '';
        $client = (string) $file->getMimeType();

        if ($detected !== $client && ! str_starts_with($detected, 'image/') && $detected !== 'application/pdf') {
            throw ValidationException::withMessages(['file' => ['mime_mismatch']]);
        }

        if ($detected === 'image/svg+xml' || $client === 'image/svg+xml') {
            throw ValidationException::withMessages(['file' => ['svg_not_allowed']]);
        }

        return $detected !== '' ? $detected : $client;
    }

    private function isAnimated(UploadedFile $file, string $mime): bool
    {
        $path = $file->getRealPath();
        if (! is_string($path) || $path === '') {
            return false;
        }

        $bytes = (string) file_get_contents($path, false, null, 0, 1024 * 64);

        if ($mime === 'image/gif') {
            return substr_count($bytes, "\x00\x21\xF9\x04") > 1;
        }

        if ($mime === 'image/webp') {
            return str_contains($bytes, 'ANIM');
        }

        return false;
    }
}
