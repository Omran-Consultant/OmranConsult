<?php

namespace App\Modules\Team\Infrastructure\Models;

use App\Modules\Team\Domain\OrgGroup;
use App\Support\Content\Publishable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['team_member_id', 'parent_id', 'group', 'title', 'sort_order', 'status', 'published_at'])]
class OrgPosition extends Model
{
    use Publishable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'group' => OrgGroup::class,
            'title' => 'array',
        ];
    }

    /**
     * @return BelongsTo<TeamMember, $this>
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class, 'team_member_id');
    }

    /**
     * @return BelongsTo<OrgPosition, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }
}
