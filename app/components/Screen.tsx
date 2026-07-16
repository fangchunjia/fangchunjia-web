import MuxPlayer from "@mux/mux-player-react";
import { coverImageUrl } from "~/lib/sanity";
import type {
  EnrichedMedia,
  ProjectInfo,
} from "~/routes/_layout.projects._index";

export default function Screen({
  item,
}: {
  item: Pick<ProjectInfo, "slug" | "cover"> | null;
}) {
  return (
    <div className="w-full h-full pointer-events-none relative">
      {item && <ScreenMedia media={item.cover.media} />}
    </div>
  );
}

// Fills the box completely, cropping overflow to cover it (object-cover). Local
// copy of MediaRenderer, forked so the Screen behavior can diverge independently.
function ScreenMedia({ media }: { media: EnrichedMedia | undefined }) {
  if (media?.mediaType === "image" && media.image?.asset?._ref) {
    return (
      <img
        src={coverImageUrl(media.image.asset._ref)}
        className="w-full h-full object-cover"
      />
    );
  }

  if (media?.mediaType === "video" && media.video?.asset?.playbackId) {
    return (
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
          width: "100%",
          height: "100%",
          // Fill the box, cropping overflow rather than letterboxing.
          ["--media-object-fit" as string]: "cover",
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
