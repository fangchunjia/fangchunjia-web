import type { EnrichedMedia } from "~/routes/_layout.projects._index";

// Single source of truth for a media's intrinsic aspect ratio, as a CSS
// `aspect-ratio` value ("W / H"). Callers own layout and use this to shape the
// box they give to <MediaRenderer>; the renderer itself stays layout-agnostic.
//
// - Video: prefer the ratio enriched onto the media in the loader (already CSS
//   format, see toCssAspectRatio in app/lib/mux.ts); otherwise fall back to the
//   raw "16:9" ratio dereferenced from the Mux asset (grid videos aren't
//   enriched — only the cover is).
// - Image: read the intrinsic ratio from the Sanity asset metadata, projected in
//   the loader onto the image as `image.aspectRatio`
//   (asset->metadata.dimensions.aspectRatio). A unitless number is a valid CSS
//   `aspect-ratio` value.
export function getMediaAspectRatio(
  media: EnrichedMedia | undefined,
): string | undefined {
  if (!media) return undefined;

  if (media.mediaType === "video") {
    if (media.aspectRatio) return media.aspectRatio;
    const raw = media.video?.asset?.aspectRatio;
    return raw ? raw.replace(":", " / ") : undefined;
  }

  if (media.mediaType === "image" && media.image?.aspectRatio) {
    return String(media.image.aspectRatio);
  }

  return undefined;
}
