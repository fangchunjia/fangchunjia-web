import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { ProjectInfo } from "~/routes/_layout.projects._index";
import MediaRenderer from "./MediaRenderer";

// Must match BLEED in _layout.projects.tsx: the media overhangs the visible
// window by this much per side on the list page, revealed by the cursor offset.
const BLEED = 8;

export default function Screen({
  item,
  isDetailPage,
  offsetX,
  offsetY,
  onExitComplete,
}: {
  item: Pick<ProjectInfo, "slug" | "cover"> | null;
  isDetailPage: boolean;
  offsetX?: MotionValue<number>;
  offsetY?: MotionValue<number>;
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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Bleed window: clips BLEED px per side on the list, opens fully on
                the detail page — the media itself keeps the same scale. */}
            <motion.div
              className={
                item.cover.fullscreen
                  ? "w-full h-full overflow-hidden"
                  : "w-[calc((100%_-_208px)/3_+_48px)] flex overflow-hidden"
              }
              initial={false}
              animate={{
                clipPath: isDetailPage ? "inset(0px)" : `inset(${BLEED}px)`,
              }}
              transition={{ duration: 0.4 }}
            >
              <MediaOffset offsetX={offsetX} offsetY={offsetY}>
                <MediaRenderer
                  media={item.cover.media}
                  objectFit={item.cover.fullscreen ? "cover" : "contain"}
                />
              </MediaOffset>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Translates the media by the shared cursor drift, hard-clamped to ±BLEED so a
// spring overshoot can never expose an empty edge beyond the bleed.
function MediaOffset({
  offsetX,
  offsetY,
  children,
}: {
  offsetX?: MotionValue<number>;
  offsetY?: MotionValue<number>;
  children: React.ReactNode;
}) {
  // Negated so the media drifts opposite to the cursor, clamped to ±BLEED so a
  // spring overshoot can never expose an empty edge beyond the bleed.
  const invertClamp = (v: number) => Math.max(-BLEED, Math.min(BLEED, -v));
  // Stable fallbacks so the hooks are called unconditionally when no drift is
  // provided (e.g. outside the projects layout).
  const zeroX = useMotionValue(0);
  const zeroY = useMotionValue(0);
  const x = useTransform(offsetX ?? zeroX, invertClamp);
  const y = useTransform(offsetY ?? zeroY, invertClamp);
  return (
    <motion.div className="w-full h-full" style={{ x, y }}>
      {children}
    </motion.div>
  );
}
