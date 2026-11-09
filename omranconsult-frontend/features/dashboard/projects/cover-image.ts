import { getSiteImage } from "@/features/media/profile-images";

export function dashboardCoverSrc(key: string | null | undefined): string | null {
  return getSiteImage(key)?.src ?? null;
}
