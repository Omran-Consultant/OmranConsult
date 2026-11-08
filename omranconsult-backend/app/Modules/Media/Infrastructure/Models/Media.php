<?php

namespace App\Modules\Media\Infrastructure\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'disk',
        'path',
        'filename',
        'original_filename',
        'mime_type',
        'size_bytes',
        'width',
        'height',
        'alt',
        'caption',
        'focal_x',
        'focal_y',
        'variants',
        'import_key',
        'is_private',
        'retention_until',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'alt' => 'array',
            'caption' => 'array',
            'variants' => 'array',
            'is_private' => 'boolean',
            'retention_until' => 'date',
            'focal_x' => 'float',
            'focal_y' => 'float',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<MediaReference, $this>
     */
    public function references(): HasMany
    {
        return $this->hasMany(MediaReference::class);
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }
}
