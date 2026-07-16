import { useEffect, useRef } from "react";
import { Outlet, useMatches } from "react-router";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { $activeProject, $hoveredEl, $hoveredProject } from "~/stores/ui";
import useCursorDrift from "~/hooks/useCursorDrift";

// Media bleed (px): the image overhangs the visible window by this much per side
// on the list page, so the cursor-driven offset can reveal it without exposing an
// empty edge. Also the ± cap on the drift.
const BLEED = 8;

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

  // Single sprung cursor-drift signal (px, capped to ±BLEED) for the <Screen>
  // image offset — same logic as the title shadow, just capped to the bleed.
  const {
    x: driftX,
    y: driftY,
    setFromCursor,
    reset,
  } = useCursorDrift({
    cap: BLEED,
  });
  // Entry point of the current hover, so the drift can mirror the title shadow's
  // raw pixel offset from where the cursor entered the item.
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const originElRef = useRef<HTMLElement | null>(null);

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
      // New hover: capture the entry point and snap to no offset (matches the
      // shadow resetting on mouseenter).
      if (el !== originElRef.current) {
        originElRef.current = el;
        originRef.current = { x: e.clientX, y: e.clientY };
        reset();
        return;
      }
      setFromCursor({ x: e.clientX, y: e.clientY }, originRef.current!);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [setFromCursor, reset, titleX, titleY]);

  // On click the cursor-follow above gates off (see !$activeProject.get()), so
  // titleX/titleY simply freeze at the last cursor position — the title holds
  // right where the pointer was and persists through the list→detail transition.

  // Ease the drift back to center whenever nothing is hovered (mouse left the
  // list, or we're on the detail page where no list item is hovered).
  useEffect(() => {
    return $hoveredEl.listen((el) => {
      if (!el) {
        originElRef.current = null;
        originRef.current = null;
        reset();
      }
    });
  }, [reset]);

  const onScreenProject = activeProject || hoveredProject || null;

  const displayItem = onScreenProject
    ? { slug: onScreenProject.slug, cover: onScreenProject.cover }
    : null;

  return (
    <>
      {onScreenProject && (
        <motion.div
          initial={{ filter: "blur(2px)" }}
          animate={{
            filter: isDetailPage ? "blur(0px)" : "blur(2px)",
            transition: { duration: 0.8 },
          }}
          style={{
            top: 0,
            left: 0,
            x: titleX,
            y: titleY,
            color: onScreenProject.accentColor.hex,
          }}
          className="font-medium text-lg mb-0 py-0 fixed z-1000"
        >
          <motion.div className="pointer-events-none top-full left-full">
            <h1>{onScreenProject.title}</h1>
          </motion.div>
        </motion.div>
      )}
      <Outlet />
    </>
  );
}
