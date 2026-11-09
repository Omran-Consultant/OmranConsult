import type { AppLocale } from "@/i18n/routing";

const LOGIN_ACTIONS = new Set(["login_succeeded", "login_failed"]);

export type ActivityEvent = {
  id: number;
  action: string;
  occurred_at: string;
  user_id: number | null;
  user_name: string | null;
};

export type GroupedActivity = ActivityEvent & { count: number };

export function prepareActivityFeed(
  events: readonly ActivityEvent[],
  { includeLogins }: { includeLogins: boolean },
): GroupedActivity[] {
  const filtered = includeLogins ? events : events.filter((event) => !LOGIN_ACTIONS.has(event.action));
  const grouped: GroupedActivity[] = [];

  for (const event of filtered) {
    const previous = grouped.at(-1);
    if (
      LOGIN_ACTIONS.has(event.action) &&
      previous &&
      previous.action === event.action &&
      previous.user_id === event.user_id
    ) {
      previous.count += 1;
      continue;
    }
    grouped.push({ ...event, count: 1 });
  }

  return grouped;
}

export function activitySentence(event: GroupedActivity, actionLabel: string, locale: AppLocale): string {
  const name = event.user_name?.trim() || (locale === "ar" ? "النظام" : "System");
  const extra = event.count > 1 ? ` ×${event.count}` : "";
  return `${name} ${actionLabel}${extra}`;
}
