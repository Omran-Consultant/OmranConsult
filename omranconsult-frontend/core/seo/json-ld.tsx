import { serializeJsonLd } from "@/core/seo/json-ld-serializer";

type JsonLdProps = {
  readonly data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
