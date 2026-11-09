<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvitationNotification extends Notification
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
        $rawEmail = $notifiable instanceof AnonymousNotifiable
            ? (string) $notifiable->routeNotificationFor('mail')
            : (string) $notifiable->email;
        $url = $frontend.'/dashboard/accept-invite?token='.urlencode($this->token).'&email='.urlencode($rawEmail);

        return (new MailMessage)
            ->subject('Invitation to the omranconsult dashboard')
            ->line('You were invited to manage website content. This link expires in 72 hours.')
            ->action('Accept invitation', $url);
    }
}
