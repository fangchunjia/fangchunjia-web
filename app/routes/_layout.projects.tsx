import { useEffect, useRef } from "react";
import { Outlet, useLocation, useMatches } from "react-router";
import { useLenis } from "lenis/react";
import { useStore } from "@nanostores/react";
import { motion } from "motion/react";
import {
  $activeProject,
  $hoveredEl,
  $hoveredProject,
  $scrollY,
} from "~/stores/ui";
import useCursorDrift from "~/hooks/useCursorDrift";
import Screen from "~/components/Screen";

// Media bleed (px): the image overhangs the visible window by this much per side
// on the list page, so the cursor-driven offset can reveal it without exposing an
// empty edge. Also the ± cap on the drift.
const BLEED = 8;

export default function ProjectsLayout() {
  const matches = useMatches();
  const isDetailPage = matches.some(
    (match) => match.id === "routes/_layout.projects.$slug",
  );
  const { pathname } = useLocation();

  // Track the (now persistent, layout-owned) Lenis scroll position and reset to
  // top on every projects navigation. Replaces the per-route ReactLenis
  // instances and the $slug unmount scrollTo hack.
  const lenis = useLenis(({ scroll }) => $scrollY.set(scroll));
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);
  const galleryWrapperRef = useRef<HTMLDivElement>(null);
  const hoveredProject = useStore($hoveredProject);
  const activeProject = useStore($activeProject);

  // Single sprung cursor-drift signal (px, capped to ±BLEED) for the <Screen>
  // image offset — same logic as the title shadow, just capped to the bleed.
  const { x: driftX, y: driftY, setFromCursor, reset } = useCursorDrift({
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
  }, [setFromCursor, reset]);

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

  // Scrolling of Gallery on /projects/$slug. On leaving detail we do NOT clear
  // the wrapper transform here — the cover must hold its scrolled position while
  // it fades out; the reset happens in Screen's onExitComplete instead.
  useEffect(() => {
    if (!isDetailPage) return;
    return $scrollY.listen((y) => {
      if (!galleryWrapperRef.current) return;
      // Write transform synchronously (same frame as Lenis's scroll emit) for
      // linear 1:1 tracking — a motion value flushes a frame later and reads as
      // springy. Plain <div> (not motion.div) so Motion/React never manage
      // `transform`, so this imperative write isn't clobbered on re-render.
      galleryWrapperRef.current.style.transform = `translateY(${-y}px)`;
    });
  }, [isDetailPage]);

  return (
    <>
      <div
        ref={galleryWrapperRef}
        className="fixed inset-0 overflow-hidden project-image h-dvh"
        style={{ viewTransitionName: "gallery-screen" }}
      >
        <motion.div className="w-full h-full">
          <Screen
            item={displayItem}
            isDetailPage={isDetailPage}
            offsetX={driftX}
            offsetY={driftY}
            onExitComplete={() => {
              if (galleryWrapperRef.current)
                galleryWrapperRef.current.style.transform = "";
            }}
          />
        </motion.div>
      </div>
      <div
        className="relative z-20"
        style={{
          viewTransitionName: isDetailPage
            ? "project-detail"
            : "project-list-page",
        }}
      >
        <Outlet />
      </div>
    </>
  );
}
