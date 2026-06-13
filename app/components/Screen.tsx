import { AnimatePresence, motion } from "motion/react";
import type { ProjectInfo } from "~/routes/_layout.projects._index";
import MediaRenderer from "./MediaRenderer";

export default function Screen({
  item,
  isDetailPage,
}: {
  item: Pick<ProjectInfo, "slug" | "cover"> | null;
  isDetailPage: boolean;
}) {
  return (
    <div className="w-full h-full pointer-events-none relative grid grid-cols-12 gap-4">
      <AnimatePresence mode="popLayout">
        <motion.div
          className={`self-center ${item?.cover.fullscreen ? "col-start-1 col-span-12" : "col-start-4 col-span-6"}`}
          animate={{
            scale: isDetailPage ? 1.06 : 1,
            transition: {
              duration: 0.4,
              delay: 0.1,
            },
          }}
        >
          <motion.div
            className="w-full aspect-4/3"
            key={item?.slug.current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <MediaRenderer
              media={item?.cover}
              objectFit={item?.cover.fullscreen ? "cover" : "contain"}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
