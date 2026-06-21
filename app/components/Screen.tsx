import { AnimatePresence, motion } from "motion/react";
import type { ProjectInfo } from "~/routes/_layout.projects._index";
import MediaRenderer from "./MediaRenderer";

export default function Screen({
  item,
  isDetailPage,
  onExitComplete,
}: {
  item: Pick<ProjectInfo, "slug" | "cover"> | null;
  isDetailPage: boolean;
  onExitComplete?: () => void;
}) {
  return (
    <div className="w-full h-full pointer-events-none relative">
      <AnimatePresence onExitComplete={onExitComplete}>
        {item && (
          <motion.div
            key={item.slug.current}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: isDetailPage ? 1.06 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              scale: { duration: 0.4, delay: isDetailPage ? 0 : 0.4 },
            }}
          >
            <div
              className={
                item.cover.fullscreen
                  ? "w-full h-full"
                  : "w-[calc((100%_-_208px)/3_+_48px)] flex"
              }
            >
              <MediaRenderer
                media={item.cover}
                objectFit={item.cover.fullscreen ? "cover" : "contain"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
