// Shared SEO metadata helpers. Routes call `seoMeta(...)` from their `meta()`
// export to emit a consistent set of title / description / Open Graph / Twitter /
// canonical descriptors. Absolute URLs (canonical, og:url) need the site origin,
// which the root loader derives from the request; `rootOrigin(matches)` reads it
// back out inside a child route's `meta()`.

import type { MetaDescriptor } from "react-router";

// Origin (e.g. "https://example.com") published by the root loader. Empty string
// if unavailable, in which case origin-dependent tags (canonical, og:url) are
// omitted rather than emitted with a wrong/relative URL. Accepts RR's `meta()`
// `matches` structurally (only `id` is needed) and reads the non-deprecated
// `loaderData`.
export function rootOrigin(
  matches: ReadonlyArray<{ id: string } | undefined>,
): string {
  const root = matches.find((m) => m?.id === "root") as
    | { loaderData?: { origin?: string } }
    | undefined;
  return root?.loaderData?.origin ?? "";
}

export type SeoInput = {
  title: string;
  description: string;
  /** Site origin from `rootOrigin(matches)`. */
  origin: string;
  /** Current path, typically `location.pathname`. */
  path: string;
  /** Absolute image URL for social cards. */
  image?: string;
  type?: "website" | "article";
};

export function seoMeta({
  title,
  description,
  origin,
  path,
  image,
  type = "website",
}: SeoInput) {
  const url = origin ? `${origin}${path}` : undefined;
  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (url) {
    tags.push({ property: "og:url", content: url });
    tags.push({ tagName: "link", rel: "canonical", href: url });
  }
  if (image) {
    tags.push({ property: "og:image", content: image });
    tags.push({ name: "twitter:image", content: image });
  }
  return tags;
}
