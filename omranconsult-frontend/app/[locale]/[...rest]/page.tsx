import { notFound } from "next/navigation";

/** Always throws notFound(), so there is no segment for instant validation to render. */
export const instant = false;

/** Unmatched public paths render the localized not-found page (next-intl pattern). */
export default function CatchAllPage() {
  notFound();
}
