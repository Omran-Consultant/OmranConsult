import { cacheLife } from "next/cache";

/** Year for the copyright line. Cached so prerendering does not read the clock (Next 16). */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");

  return new Date().getFullYear();
}
