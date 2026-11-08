import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

const PAGES = ["", "/about", "/services", "/projects", "/media", "/contact"] as const;
const NAV_KEYS = ["home", "about", "services", "projects", "media", "contact"] as const;

type Messages = typeof en;

function section(messages: Messages, origin: string, locale: "en" | "ar"): string {
  const links = PAGES.map((path, index) => `- [${messages.Layout.nav[NAV_KEYS[index]]}](${origin}/${locale}${path})`);
  return [`## ${locale === "en" ? "English" : "العربية"}`, "", `> ${messages.Metadata.description}`, "", ...links].join("\n");
}

/**
 * llms.txt (llmstxt.org): a Markdown summary of the site and its main pages in both languages.
 * It reuses the site title, description and navigation labels already in the messages.
 */
export function GET() {
  const origin = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";
  const body = [
    `# ${en.Metadata.title}`,
    "",
    `> ${en.Metadata.description}`,
    "",
    `${ar.Metadata.title}. The website is available in English (default) and Arabic.`,
    "",
    section(en, origin, "en"),
    "",
    section(ar as unknown as Messages, origin, "ar"),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
