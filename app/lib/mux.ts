import { createBlurUp } from "@mux/blurup";
import type { ProjectInfo } from "~/routes/_layout.projects._index";

type BlurUp = { blurDataURL: string; aspectRatio: number };

// Best-effort in-memory cache, keyed by playbackId. On Cloudflare Workers this
// only lasts the isolate's lifetime, but the underlying mux image fetches are
// also edge-cached, so repeated misses stay cheap.
const cache = new Map<string, BlurUp>();

/**
 * @description Generate a cheap blurred placeholder for a Mux playback id. Resilient by design: any failure resolves to null so layout/playback never break.
 */
export async function getBlurUp(playbackId: string): Promise<BlurUp | null> {
  const cached = cache.get(playbackId);
  if (cached) return cached;
  try {
    const { blurDataURL, aspectRatio } = await createBlurUp(playbackId, {
      time: 0,
    });
    const result = { blurDataURL, aspectRatio };
    cache.set(playbackId, result);
    return result;
  } catch (error) {
    console.warn(`[mux] blurup failed for ${playbackId}`, error);
    return null;
  }
}

/**
 * @description Normalize an aspect ratio into a CSS aspect-ratio value. Sanity stores it as "16:9"; blurup returns a number. Returns undefined when neither is available.
 */
function toCssAspectRatio(
  sanityRatio: string | undefined,
  blurRatio: number | undefined,
): string | undefined {
  if (sanityRatio) return sanityRatio.replace(":", " / ");
  if (blurRatio) return String(blurRatio);
  return undefined;
}

/**
 * @description Augment a project cover with a blur `placeholder` and a CSS-ready `aspectRatio` so the player can reserve its box before the video loads.
 */
export async function enrichCover(
  cover: ProjectInfo["cover"],
): Promise<ProjectInfo["cover"]> {
  const playbackId = cover?.video?.asset?.playbackId;
  if (cover?.mediaType !== "video" || !playbackId) return cover;

  const blur = await getBlurUp(playbackId);
  // `aspectRatio` is a GROQ alias of `data.aspect_ratio`; it exists at runtime
  // but isn't part of the generated MuxVideoAsset type, so read it via a cast.
  const sanityRatio = (
    cover.video?.asset as { aspectRatio?: string } | undefined
  )?.aspectRatio;
  return {
    ...cover,
    placeholder: blur?.blurDataURL,
    aspectRatio: toCssAspectRatio(sanityRatio, blur?.aspectRatio),
  };
}
