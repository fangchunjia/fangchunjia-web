import { useEffect } from "react";
import { Outlet, useMatches } from "react-router";
import { useStore } from "@nanostores/react";
import { useMotionValue } from "motion/react";
import { $activeProject, $hoveredEl, $hoveredProject } from "~/stores/ui";
import ProjectTitle from "~/components/ProjectTitle";

// Gap (px) from the cursor to the floating title's top-left corner, so the label
// sits just off the cursor's bottom-right rather than under the pointer.
const CURSOR_OFFSET = { x: 12, y: 16 };

export default function ProjectsLayout() {
  const matches = useMatches();
  const isDetailPage = matches.some(
    (match) => match.id === "routes/_layout.projects.$slug",
  );
  const hoveredProject = useStore($hoveredProject);
  const activeProject = useStore($activeProject);

  // Position (px, fixed-viewport) of the floating title overlay, driven as a
  // transform so it can track the cursor at 60fps without re-rendering.
  const titleX = useMotionValue(0);
  const titleY = useMotionValue(0);

  // This layout owns the on-screen project display for the whole projects
  // section; reset to neutral when the section unmounts (leaving to Home/About).
  useEffect(() => {
    return () => {
      $activeProject.set(null);
      $hoveredProject.set(null);
    };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = $hoveredEl.get();
      if (!el || !el.isConnected) return;
      // Float the title just off the cursor's bottom-right while hovering. Skip
      // once a project is clicked — the title then holds at its captured spot.
      if (!$activeProject.get()) {
        titleX.set(e.clientX + CURSOR_OFFSET.x);
        titleY.set(e.clientY + CURSOR_OFFSET.y);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [titleX, titleY]);

  // On click the cursor-follow above gates off (see !$activeProject.get()), so
  // titleX/titleY simply freeze at the last cursor position — the title holds
  // right where the pointer was and persists through the list→detail transition.

  const onScreenProject = activeProject || hoveredProject || null;

  return (
    <>
      {onScreenProject && (
        <ProjectTitle
          project={onScreenProject}
          reveal={isDetailPage}
          x={titleX}
          y={titleY}
        />
      )}
      <Outlet />
    </>
  );
}
