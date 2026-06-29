import { useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useMatches } from "react-router";
import { useLenis } from "lenis/react";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import {
  $activeProject,
  $hoveredEl,
  $hoveredProject,
  $scrollY,
} from "~/stores/ui";
import Screen from "~/components/Screen";
import Back from "~/components/Back";

// Layout effect on the client (runs after commit, before paint) so the shadow's
// position flips together with its React-rendered text; falls back to useEffect
// on the server to avoid the SSR warning.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

  // Title-shadow anchor (centered on the hovered title + drift) and subtitle-shadow
  // anchor (centered on the hovered subtitle, drifting by the SAME title offset).
  const titleX = useMotionValue(0);
  const titleY = useMotionValue(0);
  const subX = useMotionValue(0);
  const subY = useMotionValue(0);
  const isFollowingRef = useRef(true);
  // The element the shadow position currently follows. Kept in sync with the
  // React-rendered project (see the layout effect below) so `onMove` never moves
  // the position to a project whose text hasn't been committed yet (avoids a
  // one-frame flicker of the previous title at the new position).
  const followElRef = useRef<HTMLElement | null>(null);

  // This layout owns the on-screen project display for the whole projects
  // section; reset to neutral when the section unmounts (leaving to Home/About).
  useEffect(() => {
    return () => {
      $activeProject.set(null);
      $hoveredProject.set(null);
    };
  }, []);

  useEffect(() => {
    // Cursor acts as a light source: the shadow title sits centered on the
    // hovered item and drifts subtly in the opposite direction of the cursor.
    const DRIFT = 0.2;
    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));
    const onMove = (e: MouseEvent) => {
      if (!isFollowingRef.current) return;
      // Follow the element matching the currently RENDERED project (not the raw
      // $hoveredEl, which updates a frame ahead of React's text commit).
      const item = followElRef.current;
      // Skip a detached node: during navigation the hovered item can be removed
      // from the DOM before isFollowingRef flips, and getBoundingClientRect on a
      // detached element returns zeros — which would snap the title to (0, 0).
      if (!item || !item.isConnected) return;
      const r = item.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const halfW = r.width / 2;
      const halfH = r.height / 2;
      const relX = clamp(e.clientX - cx, -halfW, halfW);
      const relY = clamp(e.clientY - cy, -halfH, halfH);
      const offsetX = relX * 0.05;
      const offsetY = relY * DRIFT;
      // Title shadow: centered on the hovered title + drift.
      titleX.set(cx + offsetX);
      titleY.set(cy + offsetY);
      // Subtitle shadow: centered on the hovered subtitle's own position, but
      // drifting by the SAME title offset so it moves in lockstep with the title.
      const subEl = item.parentElement?.querySelector("[data-subtitle]");
      if (subEl) {
        const sr = subEl.getBoundingClientRect();
        subX.set(sr.left + sr.width / 2 + offsetX);
        subY.set(sr.top + sr.height / 2 + offsetY);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const onScreenProject = activeProject || hoveredProject || null;

  // When the rendered project changes, sync the followed element and snap the
  // shadow's base position (center, no drift) in the SAME commit/paint as the new
  // text — so content and position always flip together.
  useIsoLayoutEffect(() => {
    const el = $hoveredEl.get();
    followElRef.current = el;
    if (!el || !el.isConnected) return;
    const r = el.getBoundingClientRect();
    titleX.set(r.left + r.width / 2);
    titleY.set(r.top + r.height / 2);
    const subEl = el.parentElement?.querySelector("[data-subtitle]");
    if (subEl) {
      const sr = subEl.getBoundingClientRect();
      subX.set(sr.left + sr.width / 2);
      subY.set(sr.top + sr.height / 2);
    }
  }, [onScreenProject]);

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
            onExitComplete={() => {
              if (galleryWrapperRef.current)
                galleryWrapperRef.current.style.transform = "";
            }}
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {onScreenProject && (
          <motion.div
            key="project-title"
            // initial={{ filter: "blur(2px)" }}
            // animate={{
            //   filter: isDetailPage ? "blur(0px)" : "blur(2px)",
            //   opacity: isDetailPage ? 1 : 0.8,
            //   transition: { duration: 1 },
            // }}
            // exit={{ opacity: 0, transition: { duration: 0.4 } }}
            style={{
              x: titleX,
              y: titleY,
              viewTransitionName: "project-title",
              zIndex: isDetailPage ? 1000 : 10,
            }}
            className="font-medium fixed top-0 left-0 text-accent pointer-events-none"
          >
            <div className="-translate-x-1/2 -translate-y-1/2 flex items-center">
              <div className="p-1">
                <div className="mr-1 w-1 h-1 rounded-full bg-accent shadow-[0_0_4px_var(--color-accent)] shadow-accent/50" />
              </div>
              <h1 className="text-lg leading-[22px]">
                {onScreenProject.title}
              </h1>
            </div>
          </motion.div>
        )}
        {onScreenProject && (
          <motion.div
            key="project-subtitle"
            // initial={{ filter: "blur(2px)" }}
            // animate={{
            //   filter: isDetailPage ? "blur(0px)" : "blur(2px)",
            //   opacity: isDetailPage ? 1 : 0.8,
            //   transition: { duration: 1 },
            // }}
            // exit={{ opacity: 0, transition: { duration: 0.4 } }}
            style={{
              x: subX,
              y: subY,
              viewTransitionName: "project-subtitle",
              zIndex: isDetailPage ? 1000 : 10,
            }}
            className="font-medium text-md fixed top-0 left-0 text-accent pointer-events-none"
          >
            <div className="-translate-x-1/2 -translate-y-1/2 text-md">
              {onScreenProject.subtitle}
            </div>
          </motion.div>
        )}
        {onScreenProject && isDetailPage && (
          <motion.div
            key="project-back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            style={{ y: titleY, zIndex: 1000 }}
            className="font-medium fixed top-0 left-4 text-accent"
          >
            <div className="-translate-y-1/2">
              <Back />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
