import MuxPlayer from "@mux/mux-player-react";
import { coverImageUrl } from "~/lib/sanity";
import type { EnrichedMedia } from "~/routes/_layout.projects._index";

// Renders the media at its own aspect ratio, fitted inside whatever box the
// parent gives it, pinned to the bottom-right. Works both in a fixed frame
// (Screen) and in a width-driven flow cell (MediaGrid) — see the video note.
export default function MediaRenderer({
  media,
}: {
  media: EnrichedMedia | undefined;
}) {
  if (media?.mediaType === "image" && media.image?.asset?._ref) {
    return (
      <div className="flex w-full h-full">
        {/* Replaced element: max-w/max-h shrink the <img> to fit the box at its
            intrinsic ratio, so the element IS the fitted image. */}
        <img
          src={coverImageUrl(media.image.asset._ref)}
          className="max-w-full max-h-full"
        />
      </div>
    );
  }

  if (media?.mediaType === "video" && media.video?.asset?.playbackId) {
    const ratio = media.aspectRatio;
    return (
      <div
        className="flex w-full max-h-full justify-end items-end"
        // aspect-ratio gives the box a definite height (width ÷ ratio) in BOTH a
        // fixed frame and an auto-height flow cell, so `container-type: size`
        // can't collapse it — and it lets the video fit itself via cq units.
        style={
          ratio ? { aspectRatio: ratio, containerType: "size" } : undefined
        }
      >
        <MuxPlayer
          playbackId={media.video.asset.playbackId}
          placeholder={media.placeholder}
          loop
          muted
          streamType="on-demand"
          preload="metadata"
          autoPlay
          thumbnailTime={0}
          style={{
            aspectRatio: ratio,
            // Fit to the box at the video's own ratio: width = min(box width,
            // box height × ratio); height follows from aspect-ratio. No letterbox.
            width: ratio ? `min(100cqw, calc(100cqh * ${ratio}))` : "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            // Safety against sub-pixel ratio mismatch: contain + transparent so
            // any hairline gap shows the frame, not black.
            ["--media-object-fit" as string]: "contain",
            ["--media-background-color" as string]: "transparent",
          }}
          metadata={{
            video_id: media.video.asset.playbackId,
            video_title: "",
          }}
        />
      </div>
    );
  }

  return null;
}
