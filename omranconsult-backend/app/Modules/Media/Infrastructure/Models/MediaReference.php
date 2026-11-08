<?php

namespace App\Modules\Media\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MediaReference extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'media_id',
        'referencer_type',
        'referencer_id',
        'field',
    ];

    /**
     * @return BelongsTo<Media, $this>
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function referencer(): MorphTo
    {
        return $this->morphTo();
    }
}
