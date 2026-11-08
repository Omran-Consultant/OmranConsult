/**
 * Indexing policy. Only the configured production domain is indexable.
 * Previews, tunnels and localhost send `noindex` and a disallow-all robots.txt.
 *
 * `SITE_INDEXABLE=true` is set only in production. Even then, a request whose host differs
 * from the host of `NEXT_PUBLIC_SITE_URL` stays noindex, so a preview built with the
 * production variables is still never indexed.
 */
export const NOINDEX_VALUE = "noindex, nofollow";

type Env = Readonly<Record<string, string | undefined>>;

function hostOf(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return undefined;
  }
}

export function isIndexableHost(requestHost: string | null | undefined, env: Env = process.env): boolean {
  if (env.SITE_INDEXABLE?.trim() !== "true") {
    return false;
  }

  const configured = hostOf(env.NEXT_PUBLIC_SITE_URL?.trim());
  const requested = requestHost?.split(",")[0]?.trim().toLowerCase();
  return Boolean(configured && requested && configured === requested);
}
