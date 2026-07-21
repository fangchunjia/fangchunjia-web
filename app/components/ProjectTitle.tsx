import { motion, type MotionValue } from "motion/react";
import type { ProjectInfo } from "~/routes/_layout.projects._index";
import DistortedText from "./DistortedText";

export default function ProjectTitle({
  project,
  reveal,
  x,
  y,
}: {
  project: ProjectInfo;
  reveal: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  return (
    <motion.div
      // Decorative floating label that duplicates the route's real (sr-only)
      // <h1>; hidden from assistive tech so there's a single heading per page.
      aria-hidden="true"
      initial={{
        filter: "blur(2px)",
        backgroundColor: "rgba(231, 231, 231, 0)",
      }}
      animate={{
        filter: reveal ? "blur(0px)" : "blur(2px)",
        // On reveal: snap to the dark bg, then animate to the lighter one (the
        // array is the keyframe sequence). When not revealed: fade the bg out.
        backgroundColor: reveal
          ? [
              "var(--color-fangchunjia-gray-dark)",
              "var(--color-fangchunjia-gray)",
            ]
          : "",
        transition: { duration: 0.8 },
      }}
      style={{
        top: 0,
        left: 0,
        x: x,
        y: y,
        color: project.accentColor.hex,
      }}
      className="font-medium text-lg fixed z-chrome"
    >
      <div className="pointer-events-none leading-6">
        <DistortedText as="span" preset="strong">
          {project.title}
        </DistortedText>
      </div>
    </motion.div>
  );
}
