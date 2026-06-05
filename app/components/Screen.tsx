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
    <div className="w-full h-full pointer-events-none relative grid grid-cols-12 gap-4 p-4 pt-28">
      <AnimatePresence>
        {item?.cover.mediaType === "image" && item.cover.image?.asset?._ref && (
          <div className="col-start-4 col-span-6 *:w-full *:aspect-4/3">
            <motion.img
              key={item.slug.current}
              src={urlFor(item.cover.image.asset._ref).url()}
              className="object-cover "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
        {item?.cover.mediaType === "video" &&
          item.cover.video?.asset?.playbackId !== undefined && (
            <div className="col-start-4 col-span-6 *:w-full *:aspect-4/3">
              <motion.div
                key={item.slug.current}
                className=""
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
            </div>
          )}
      </AnimatePresence>
    </div>
  );
}
