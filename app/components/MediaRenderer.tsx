import MuxPlayer from "@mux/mux-player-react";
import { coverImageUrl } from "~/lib/sanity";
import type { ProjectInfo } from "~/routes/_layout.projects._index";

export default function MediaRenderer({
  media,
  objectFit = "contain",
}: {
  media: ProjectInfo["cover"] | undefined;
  objectFit?: "fit" | "contain" | "cover";
}) {
  return (
    <div className="flex w-full h-full">
      {media?.mediaType === "image" && media.image?.asset?._ref && (
        <img
          src={coverImageUrl(media.image.asset._ref)}
          className={`w-full h-full object-center object-${objectFit}`}
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
            className="w-full m-auto"
            style={{
              // Reserve the box at the video's aspect ratio before metadata
              // loads, so the player doesn't jump from a tiny box to full size.
              aspectRatio: media.aspectRatio,
              ["--media-object-fit" as string]: objectFit,
              ["--media-object-position" as string]: "center",
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
