<?php

namespace App\Modules\Newsletter\Infrastructure\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Newsletter subscriber (SDD §6.7 P20). The email is stored lower-cased.
 */
#[Fillable(['email', 'locale', 'consented_at'])]
class NewsletterSubscriber extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'consented_at' => 'datetime',
        ];
    }
}
