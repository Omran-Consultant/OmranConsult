<?php

namespace App\Http\Resources\Api\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class AdminUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->getRoleNames()->values()->all(),
            'permissions' => $this->getAllPermissions()->pluck('name')->values()->all(),
            'is_active' => (bool) $this->is_active,
            'department' => $this->department,
            'dashboard_locale' => $this->dashboard_locale,
            'notify_inquiries' => (bool) $this->notify_inquiries,
            'mfa_enabled' => $this->mfaIsEnabled(),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
        ];
    }
}
