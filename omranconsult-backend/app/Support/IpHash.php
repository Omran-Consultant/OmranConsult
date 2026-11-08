<?php

namespace App\Support;

final class IpHash
{
    public static function make(?string $ip): string
    {
        return hash_hmac('sha256', (string) $ip, (string) config('app.key'));
    }
}
