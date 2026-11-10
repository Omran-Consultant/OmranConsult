<?php

namespace App\Support\Content;

/**
 * Icon keys editors may pick for axes and tools (Q21). Matches the public IconName set used on services.
 */
final class SemanticIcons
{
    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            'hard-hat',
            'clipboard',
            'chart',
            'car',
            'total-station',
            'gps',
            'desktop',
            'printer',
            'copy',
            'jeep',
            'fingerprint',
            'drone',
            'blueprint',
            'layers',
            'cog',
            'building',
            'buildings',
            'compass',
            'target',
            'users',
            'globe',
            'shield-check',
        ];
    }

    public static function isAllowed(?string $icon): bool
    {
        return $icon === null || $icon === '' || in_array($icon, self::all(), true);
    }
}
