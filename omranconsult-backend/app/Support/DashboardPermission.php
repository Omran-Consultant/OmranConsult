<?php

namespace App\Support;

final class DashboardPermission
{
    public const SUMMARY_VIEW = 'dashboard.summary.view';

    public const PROJECTS_VIEW = 'content.projects.view';

    public const PROJECTS_CREATE = 'content.projects.create';

    public const PROJECTS_UPDATE = 'content.projects.update';

    public const PROJECTS_DELETE = 'content.projects.delete';

    public const PROJECTS_PUBLISH = 'content.projects.publish';

    public const PROJECTS_RESTORE = 'content.projects.restore';

    public const SERVICES_VIEW = 'content.services.view';

    public const NEWS_VIEW = 'content.news.view';

    public const PAGES_VIEW = 'content.pages.view';

    public const PARTNERS_VIEW = 'content.partners.view';

    public const CLIENTS_VIEW = 'content.clients.view';

    public const REGIONS_VIEW = 'content.regions.view';

    public const SECTORS_VIEW = 'content.sectors.view';

    public const TEAM_VIEW = 'content.team.view';

    public const DOCUMENTS_VIEW = 'content.documents.view';

    public const MEDIA_VIEW = 'content.media.view';

    public const MEDIA_CREATE = 'content.media.create';

    public const MEDIA_UPDATE = 'content.media.update';

    public const MEDIA_DELETE = 'content.media.delete';

    public const MEDIA_FORCE_DELETE = 'content.media.force_delete';

    public const PREVIEW = 'content.preview';

    public const DISPUTES_VIEW = 'content.disputes.view';

    public const DISPUTES_CREATE = 'content.disputes.create';

    public const DISPUTES_RESOLVE = 'content.disputes.resolve';

    public const TRASH_VIEW = 'content.trash.view';

    public const TRASH_RESTORE = 'content.trash.restore';

    public const TRASH_FORCE_DELETE = 'content.trash.force_delete';

    public const INQUIRIES_VIEW = 'inbox.inquiries.view';

    public const INQUIRIES_UPDATE = 'inbox.inquiries.update';

    public const NEWSLETTER_VIEW = 'inbox.newsletter.view';

    public const NEWSLETTER_UPDATE = 'inbox.newsletter.update';

    public const INBOX_EXPORT = 'inbox.export';

    public const USERS_VIEW = 'admin.users.view';

    public const USERS_CREATE = 'admin.users.create';

    public const USERS_UPDATE = 'admin.users.update';

    public const SETTINGS_VIEW = 'admin.settings.view';

    public const SETTINGS_UPDATE = 'admin.settings.update';

    public const AUDIT_VIEW = 'admin.audit.view';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::SUMMARY_VIEW,
            self::PROJECTS_VIEW,
            self::PROJECTS_CREATE,
            self::PROJECTS_UPDATE,
            self::PROJECTS_DELETE,
            self::PROJECTS_PUBLISH,
            self::PROJECTS_RESTORE,
            self::SERVICES_VIEW,
            self::NEWS_VIEW,
            self::PAGES_VIEW,
            self::PARTNERS_VIEW,
            self::CLIENTS_VIEW,
            self::REGIONS_VIEW,
            self::SECTORS_VIEW,
            self::TEAM_VIEW,
            self::DOCUMENTS_VIEW,
            self::MEDIA_VIEW,
            self::MEDIA_CREATE,
            self::MEDIA_UPDATE,
            self::MEDIA_DELETE,
            self::MEDIA_FORCE_DELETE,
            self::PREVIEW,
            self::DISPUTES_VIEW,
            self::DISPUTES_CREATE,
            self::DISPUTES_RESOLVE,
            self::TRASH_VIEW,
            self::TRASH_RESTORE,
            self::TRASH_FORCE_DELETE,
            self::INQUIRIES_VIEW,
            self::INQUIRIES_UPDATE,
            self::NEWSLETTER_VIEW,
            self::NEWSLETTER_UPDATE,
            self::INBOX_EXPORT,
            self::USERS_VIEW,
            self::USERS_CREATE,
            self::USERS_UPDATE,
            self::SETTINGS_VIEW,
            self::SETTINGS_UPDATE,
            self::AUDIT_VIEW,
        ];
    }

    /**
     * @return list<string>
     */
    public static function editor(): array
    {
        return array_values(array_filter(
            self::all(),
            fn (string $permission): bool => ! in_array($permission, [
                self::MEDIA_FORCE_DELETE,
                self::DISPUTES_RESOLVE,
                self::TRASH_FORCE_DELETE,
                self::INBOX_EXPORT,
                self::USERS_VIEW,
                self::USERS_CREATE,
                self::USERS_UPDATE,
                self::SETTINGS_VIEW,
                self::SETTINGS_UPDATE,
                self::AUDIT_VIEW,
            ], true),
        ));
    }
}
