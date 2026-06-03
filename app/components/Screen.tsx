import { AnimatePresence, motion } from "motion/react";
import { urlFor } from "~/lib/sanity";
import MuxPlayer from "@mux/mux-player-react";
import type { ProjectInfo } from "~/routes/_layout.projects._index";

export default function Screen({
  item,
}: {
  item: Pick<ProjectInfo, "slug" | "cover"> | null;
}) {
  return (
    <div className="w-full h-full pointer-events-none relative">
      <AnimatePresence>
        {item?.cover.mediaType === "image" && item.cover.image?.asset?._ref && (
          <motion.img
            key={item.slug.current}
            src={urlFor(item.cover.image.asset._ref).url()}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
        {item?.cover.mediaType === "video" &&
          item.cover.video?.asset?.playbackId !== undefined && (
            <motion.div
              key={item.slug.current}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <MuxPlayer
                playbackId={item.cover.video?.asset?.playbackId}
                loop
                muted
                streamType="on-demand"
                preload="metadata"
                autoPlay
                thumbnailTime={0}
                style={{
                  width: "100%",
                  height: "100%",
                  ["--media-object-fit" as string]: "cover",
                  ["--media-object-position" as string]: "center",
                }}
                metadata={{
                  video_id: "video-id-54321",
                  video_title: "Test video title",
                }}
              />
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
