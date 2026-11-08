<?php

namespace App\Support\Auth;

use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

final class TotpService
{
    public const RECOVERY_CODE_COUNT = 8;

    public const WINDOW = 1;

    public function __construct(private readonly Google2FA $google2fa = new Google2FA) {}

    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    public function qrSvg(string $email, string $secret): string
    {
        $otpauth = $this->google2fa->getQRCodeUrl('omranconsult', $email, $secret);
        $writer = new Writer(new ImageRenderer(
            new RendererStyle(192),
            new SvgImageBackEnd,
        ));

        return $writer->writeString($otpauth);
    }

    public function verify(string $secret, string $code, User $user, bool $consume = true): bool
    {
        $normalized = preg_replace('/\s+/', '', $code) ?? '';
        if (! preg_match('/^\d{6}$/', $normalized)) {
            return false;
        }

        $oldTimestamp = $consume ? (int) Cache::get($this->usedKey($user), 0) : 0;
        $timestamp = $this->google2fa->verifyKeyNewer(
            $secret,
            $normalized,
            $oldTimestamp,
            self::WINDOW,
        );

        if ($timestamp === false) {
            return false;
        }

        if ($consume) {
            Cache::put($this->usedKey($user), (int) $timestamp, now()->addMinutes(3));
        }

        return true;
    }

    /**
     * @return list<string>
     */
    public function plainRecoveryCodes(): array
    {
        return collect(range(1, self::RECOVERY_CODE_COUNT))
            ->map(fn (): string => Str::upper(Str::random(4).'-'.Str::random(4)))
            ->all();
    }

    /**
     * @param  list<string>  $plain
     * @return list<string>
     */
    public function hashRecoveryCodes(array $plain): array
    {
        return array_map(fn (string $code): string => Hash::make($code), $plain);
    }

    /**
     * @param  list<string>  $hashed
     * @return list<string>|null
     */
    public function consumeRecoveryCode(array $hashed, string $code): ?array
    {
        $normalized = Str::upper(trim($code));

        foreach ($hashed as $index => $hash) {
            if (Hash::check($normalized, $hash)) {
                unset($hashed[$index]);

                return array_values($hashed);
            }
        }

        return null;
    }

    private function usedKey(User $user): string
    {
        return 'admin-mfa-used:'.$user->id;
    }
}
