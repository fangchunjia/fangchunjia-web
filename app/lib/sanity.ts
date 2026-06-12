import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: "bhisrdlp",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(client);
export const urlFor = (source: any) => builder.image(source);

// Cover image source ref, optimized for on-screen display. Used by both the
// eager warm-up (preload) and the render so the URLs always match.
export const coverImageUrl = (ref: string) =>
  urlFor(ref).width(1600).auto("format").quality(80).url();
