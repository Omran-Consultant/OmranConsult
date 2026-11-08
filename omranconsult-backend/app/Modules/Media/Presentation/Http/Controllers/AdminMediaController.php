<?php

namespace App\Modules\Media\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Media\Application\MediaUploader;
use App\Modules\Media\Infrastructure\Models\Media;
use App\Support\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AdminMediaController extends Controller
{
    public function __construct(
        private readonly MediaUploader $uploader,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['sometimes', 'string', 'max:120'],
            'type' => ['sometimes', 'in:image,pdf'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $items = Media::query()
            ->when(isset($validated['q']), function ($query) use ($validated): void {
                $term = '%'.$validated['q'].'%';
                $query->where(function ($inner) use ($term): void {
                    $inner->where('original_filename', 'like', $term)
                        ->orWhere('filename', 'like', $term)
                        ->orWhere('import_key', 'like', $term);
                });
            })
            ->when(($validated['type'] ?? null) === 'image', fn ($query) => $query->where('mime_type', 'like', 'image/%'))
            ->when(($validated['type'] ?? null) === 'pdf', fn ($query) => $query->where('mime_type', 'application/pdf'))
            ->orderByDesc('id')
            ->paginate(40);

        return response()->json([
            'data' => collect($items->items())->map(fn (Media $media): array => $this->serialize($media))->values(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file'],
        ]);

        $media = $this->uploader->store($request->file('file'), $request->user());
        $this->audit->write($request->user(), 'media_uploaded', Media::class, $media->id, [
            'mime_type' => $media->mime_type,
        ], $request);

        return response()->json(['data' => $this->serialize($media)], 201);
    }

    public function show(Media $media): JsonResponse
    {
        return response()->json(['data' => $this->serialize($media->load('references'))]);
    }

    public function update(Request $request, Media $media): JsonResponse
    {
        $validated = $request->validate([
            'alt' => ['sometimes', 'array'],
            'alt.ar' => ['sometimes', 'nullable', 'string', 'max:255'],
            'alt.en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'caption' => ['sometimes', 'array'],
            'caption.ar' => ['sometimes', 'nullable', 'string', 'max:500'],
            'caption.en' => ['sometimes', 'nullable', 'string', 'max:500'],
            'focal_x' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
            'focal_y' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
        ]);

        $media->fill($validated)->save();
        $this->audit->write($request->user(), 'media_updated', Media::class, $media->id, array_keys($validated), $request);

        return response()->json(['data' => $this->serialize($media)]);
    }

    public function destroy(Request $request, Media $media): JsonResponse
    {
        if ($media->references()->exists()) {
            throw ValidationException::withMessages(['media' => ['media_in_use']]);
        }

        $media->delete();
        $this->audit->write($request->user(), 'media_deleted', Media::class, $media->id, null, $request);

        return response()->json(['message' => 'Deleted.']);
    }

    public function forceDestroy(Request $request, Media $media): JsonResponse
    {
        $request->validate([
            'confirmation' => ['required', 'in:DELETE'],
        ]);

        if ($media->references()->exists()) {
            throw ValidationException::withMessages(['media' => ['media_in_use']]);
        }

        if ($media->disk === 'public') {
            Storage::disk('public')->delete($media->path);
            foreach (($media->variants ?? []) as $variantPath) {
                Storage::disk('public')->delete($variantPath);
            }
        }

        $media->forceDelete();
        $this->audit->write($request->user(), 'media_force_deleted', Media::class, $media->id, null, $request);

        return response()->json(['message' => 'Force deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Media $media): array
    {
        $url = $media->disk === 'public'
            ? Storage::disk('public')->url($media->path)
            : rtrim((string) config('cms.frontend_url'), '/').'/'.$media->path;

        return [
            'id' => $media->id,
            'disk' => $media->disk,
            'path' => $media->path,
            'filename' => $media->filename,
            'original_filename' => $media->original_filename,
            'mime_type' => $media->mime_type,
            'size_bytes' => $media->size_bytes,
            'width' => $media->width,
            'height' => $media->height,
            'alt' => $media->alt,
            'caption' => $media->caption,
            'focal_x' => $media->focal_x,
            'focal_y' => $media->focal_y,
            'variants' => $media->variants,
            'import_key' => $media->import_key,
            'url' => $url,
            'references' => $media->relationLoaded('references')
                ? $media->references->map(fn ($reference): array => [
                    'type' => $reference->referencer_type,
                    'id' => $reference->referencer_id,
                    'field' => $reference->field,
                ])->values()
                : [],
        ];
    }
}
