import MuxPlayer from "@mux/mux-player-react";
import { coverImageUrl } from "~/lib/sanity";
import type { EnrichedMedia } from "~/routes/_layout.projects._index";

export default function MediaRenderer({
  media,
  objectFit = "contain",
  objectPosition = "center",
}: {
  media: EnrichedMedia | undefined;
  objectFit?: "fit" | "contain" | "cover";
  objectPosition?: string;
}) {
  return (
    <div className="flex w-full h-full">
      {media?.mediaType === "image" && media.image?.asset?._ref && (
        <img
          src={coverImageUrl(media.image.asset._ref)}
          className={`w-full h-full ${objectFit === "contain" && "object-contain"} ${objectFit === "cover" && "object-cover"}`}
          style={{ objectPosition }}
        />
      )}
      {media?.mediaType === "video" &&
        media.video?.asset?.playbackId !== undefined && (
          <MuxPlayer
            playbackId={media.video?.asset?.playbackId}
            placeholder={media.placeholder}
            loop
            muted
            streamType="on-demand"
            preload="metadata"
            autoPlay
            thumbnailTime={0}
            // contain fills the fixed frame so object-fit can letterbox the
            // video at its native ratio; cover stays content-sized (MediaGrid).
            className={objectFit === "contain" ? "w-full h-full" : "w-full m-auto"}
            style={{
              // Reserve the box at the video's aspect ratio before metadata
              // loads, so the player doesn't jump from a tiny box to full size.
              aspectRatio: media.aspectRatio,
              ["--media-object-fit" as string]: objectFit,
              ["--media-object-position" as string]: objectPosition,
              // Let the frame show through the letterbox area instead of the
              // player's default black background (--media-background-color: #000).
              ["--media-background-color" as string]: "transparent",
            }}
            metadata={{
              video_id: media.video?.asset?.playbackId,
              video_title: "",
            }}
          />
        )}
    </div>
  );
}
