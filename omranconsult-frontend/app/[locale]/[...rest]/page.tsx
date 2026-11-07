import { notFound } from "next/navigation";

/** Unmatched public paths render the localized not-found page (next-intl pattern). */
export default function CatchAllPage() {
  notFound();
}
