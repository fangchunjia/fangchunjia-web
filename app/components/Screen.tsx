import { AnimatePresence, aspectRatio, motion } from "motion/react";
import { coverImageUrl } from "~/lib/sanity";
import MuxPlayer from "@mux/mux-player-react";
import type { ProjectInfo } from "~/routes/_layout.projects._index";

export default function Screen({
  item,
  isDetailPage,
}: {
  item: Pick<ProjectInfo, "slug" | "cover"> | null;
  isDetailPage: boolean;
}) {
  // console.log(item);
  // console.log(item?.cover.video?.asset?.aspectRatio?.replace(":", "/"));
  return (
    <div className="w-full h-full pointer-events-none relative grid grid-cols-12 gap-4">
      <AnimatePresence>
        {item?.cover.mediaType === "image" &&
          item.cover.image?.asset?._ref &&
          (item.cover.fullscreen ? (
            <motion.div
              className="col-start-1 col-span-12 *:w-full"
              animate={{
                scale: isDetailPage ? 1.06 : 1,
                transition: {
                  duration: 0.4,
                  delay: 0.1,
                },
              }}
            >
              <motion.img
                key={item.slug.current}
                src={coverImageUrl(item.cover.image.asset._ref)}
                className="object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          ) : (
            <motion.div
              className="col-start-4 col-span-6 *:w-full *:aspect-4/3 m-auto"
              animate={{
                scale: isDetailPage ? 1.06 : 1,
                transition: {
                  duration: 0.2,
                  delay: 0.1,
                  ease: "linear",
                  // type: "spring",
                  // stiffness: 400,
                  // damping: 25,
                },
              }}
            >
              <motion.img
                key={item.slug.current}
                src={coverImageUrl(item.cover.image.asset._ref)}
                className="object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          ))}
        {item?.cover.mediaType === "video" &&
          item.cover.video?.asset?.playbackId !== undefined && (
            <motion.div
              className={
                "col-start-4 col-span-6 *:w-full *:aspect-" +
                item.cover.video.asset.aspectRatio.replace(":", "/")
              }
              // style={{
              //   aspectRatio: item.cover.video.asset.aspectRatio.replace(
              //     ":",
              //     "/",
              //   ),
              // }}
              animate={{
                scale: isDetailPage ? 1.04 : 1,
                transition: {
                  duration: 0.2,
                },
              }}
            >
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
                    height: "fit-content",
                    ["--media-object-fit" as string]: "contain",
                    ["--media-object-position" as string]: "center",
                  }}
                  metadata={{
                    video_id: "video-id-54321",
                    video_title: "Test video title",
                  }}
                />
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
