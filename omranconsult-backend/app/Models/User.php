<?php

namespace App\Models;

use App\Notifications\AdminResetPasswordNotification;
use App\Support\EditorRole;
use App\Support\SuperAdminRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable([
    'name',
    'email',
    'password',
    'is_active',
    'last_login_at',
    'locked_until',
    'failed_login_count',
    'mfa_secret',
    'mfa_recovery_codes',
    'mfa_enabled_at',
    'notify_inquiries',
    'dashboard_locale',
    'department',
])]
#[Hidden(['password', 'remember_token', 'mfa_secret', 'mfa_recovery_codes'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
        'notify_inquiries' => true,
        'failed_login_count' => 0,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'locked_until' => 'datetime',
            'mfa_secret' => 'encrypted',
            'mfa_recovery_codes' => 'array',
            'mfa_enabled_at' => 'datetime',
            'notify_inquiries' => 'boolean',
        ];
    }

    public function hasDashboardRole(): bool
    {
        return $this->hasAnyRole([SuperAdminRole::NAME, EditorRole::NAME]);
    }

    public function mfaIsEnabled(): bool
    {
        return $this->mfa_enabled_at !== null && filled($this->mfa_secret);
    }

    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $this->notify(new AdminResetPasswordNotification($token));
    }
}
