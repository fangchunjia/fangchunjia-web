import MuxPlayer from "@mux/mux-player-react";
import { coverImageUrl } from "~/lib/sanity";
import type { EnrichedMedia } from "~/routes/_layout.projects._index";

// Purely presentational: picks the right element (image or Mux video) and fills
// whatever box its parent gives it. Layout — box size and aspect ratio — is the
// caller's responsibility (see getMediaAspectRatio). `fit` controls whether the
// media covers the box (cropping overflow) or is contained within it.
//
// Video playback has two mutually-exclusive modes, so autoplay never races the
// controlled `paused` state:
//   - `paused` omitted → uncontrolled `autoPlay` (cover / screen).
//   - `paused` provided → controlled, no `autoPlay` (grid cells gate on viewport).
export default function MediaRenderer({
  media,
  fit = "contain",
  paused,
}: {
  media: EnrichedMedia | undefined;
  fit?: "cover" | "contain";
  paused?: boolean;
}) {
  if (media?.mediaType === "image" && media.image?.asset?._ref) {
    return (
      <img
        src={coverImageUrl(media.image.asset._ref)}
        alt={media.alt ?? ""}
        className="w-full h-full"
        style={{ objectFit: fit }}
      />
    );
  }

  if (media?.mediaType === "video" && media.video?.asset?.playbackId) {
    // Controlled (grid) vs. uncontrolled (cover/screen) — never both, so
    // autoplay can't fight the `paused` prop. See the component doc comment.
    const playbackProps =
      paused === undefined ? { autoPlay: true } : { paused };
    return (
      <MuxPlayer
        playbackId={media.video.asset.playbackId}
        placeholder={media.placeholder}
        loop
        muted
        streamType="on-demand"
        preload="metadata"
        {...playbackProps}
        thumbnailTime={0}
        style={{
          width: "100%",
          height: "100%",
          // Background-style playback: hide the whole control bar.
          ["--controls" as string]: "none",
          ["--media-object-fit" as string]: fit,
          ["--media-background-color" as string]: "transparent",
        }}
        metadata={{
          video_id: media.video.asset.playbackId,
          video_title: "",
        }}
      />
    );
  }

  return null;
}
