import { useStore } from "@nanostores/react";
import { motion } from "motion/react";
import { useLocation, useMatches, useRouteLoaderData } from "react-router";
import { $activePos, $activeProject } from "~/stores/ui";
import type { loader as slugLoader } from "~/routes/_layout.projects.$slug";
import type { ProjectInfo } from "~/routes/_layout.projects._index";

const DETAIL_LANDING = { top: 112, left: 32 };

export default function ProjectTitle({ project }: { project: ProjectInfo }) {
  const activePos = useStore($activePos);

  const matches = useMatches();
  const isDetailPage = matches.some(
    (match) => match.id === "routes/_layout.projects.$slug",
  );

  // const title = activeProject?.title ?? slugData?.project?.title;

  // if (!title) return null;
  // if (!isDetailPage && !activePos) return null;

  const targetPos = activePos
    ? { top: activePos!.top, left: activePos!.left }
    : DETAIL_LANDING;

  const hasListOrigin = !!activePos;

  return (
    <motion.div
      initial={{
        top: hasListOrigin ? activePos!.top : DETAIL_LANDING.top,
        left: hasListOrigin ? activePos!.left : DETAIL_LANDING.left,
        // color: hasListOrigin ? PINK : "#000000",
        opacity: 1,
      }}
      animate={{
        top: targetPos.top,
        left: targetPos.left,
        // color: PINK,
        opacity: isDetailPage ? 1 : 0,
      }}
      transition={{
        top: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
        left: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
        color: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
        opacity: {
          duration: 0.3,
          ease: "easeOut",
          delay: isDetailPage ? 0 : 0.4,
        },
      }}
      style={{
        position: "fixed",
        zIndex: 5000,
        pointerEvents: "none",
        viewTransitionName: "project-title",
      }}
      className="font-medium text-2xl mb-0 py-0 blur-[2px] text-accent"
    >
      <motion.div>
        <h1>{project.title}</h1>
      </motion.div>
      <motion.div>(close)</motion.div>
    </motion.div>
  );
}
