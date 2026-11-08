<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly string $token) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontend = rtrim((string) config('cms.frontend_url', 'http://localhost:3000'), '/');
        $url = $frontend.'/dashboard/reset-password?token='.urlencode($this->token).'&email='.urlencode((string) $notifiable->email);

        return (new MailMessage)
            ->subject('Reset your omranconsult dashboard password')
            ->line('Use the button below to choose a new password. This link expires in 60 minutes.')
            ->action('Reset password', $url);
    }
}
