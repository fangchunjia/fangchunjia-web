import { useEffect, useRef } from "react";
import { useLocation, useMatches, useOutlet } from "react-router";
import { useLenis } from "lenis/react";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { $activeProject, $hoveredProject, $scrollY } from "~/stores/ui";
import Screen from "~/components/Screen";

export default function ProjectsLayout() {
  const matches = useMatches();
  const isDetailPage = matches.some(
    (match) => match.id === "routes/_layout.projects.$slug",
  );
  const { pathname } = useLocation();
  const outlet = useOutlet();

  // Track the (now persistent, layout-owned) Lenis scroll position and reset to
  // top on every projects navigation. Replaces the per-route ReactLenis
  // instances and the $slug unmount scrollTo hack.
  const lenis = useLenis(({ scroll }) => $scrollY.set(scroll));
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);
  const hoveredProject = useStore($hoveredProject);
  const activeProject = useStore($activeProject);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  // Gallery cover's scroll-follow offset. Driven as a motion value (not an
  // imperative style.transform) so Motion owns the transform and won't clobber
  // it back to 0 on re-renders during the transition.
  const galleryY = useMotionValue(0);
  const isFollowingRef = useRef(true);

  // This layout owns the on-screen project display for the whole projects
  // section; reset to neutral when the section unmounts (leaving to Home/About).
  useEffect(() => {
    return () => {
      $activeProject.set(null);
      $hoveredProject.set(null);
    };
  }, []);

  useEffect(() => {
    isFollowingRef.current = !isDetailPage;
  }, [isDetailPage]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isFollowingRef.current) return;
      cursorX.set(e.clientX + 16);
      cursorY.set(e.clientY + 16);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

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
      // Track scroll 1:1 so the fixed cover scrolls away with the content
      // (no clamp — capping it left the cover parked a sliver short).
      galleryY.set(-y);
    });
  }, [isDetailPage]);

  return (
    <>
      <motion.div
        className="fixed inset-0 overflow-hidden project-image"
        initial={{
          height: "100dvh",
        }}
        style={{ y: galleryY }}
      >
        <Screen
          item={displayItem}
          isDetailPage={isDetailPage}
          onExitComplete={() => galleryY.set(0)}
        />
      </motion.div>
      {/* {onScreenProject && (
        <div className="">
          <ProjectTitle project={onScreenProject} />
        </div>
      )} */}
      <AnimatePresence>
        {onScreenProject && (
          <motion.div
            key="project-title"
            initial={{ filter: "blur(2px)" }}
            animate={{
              filter: isDetailPage ? "blur(0px)" : "blur(2px)",
              opacity: isDetailPage ? 1 : 0.8,
              backgroundColor: isDetailPage ? "#e7e7e7ff" : "#e7e7e700",
              transition: { duration: 1 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            style={{
              top: 0,
              left: 0,
              x: cursorX,
              y: cursorY,
            }}
            className="font-medium text-lg mb-0 py-0 fixed z-1000 text-accent"
          >
            <motion.div className="pointer-events-none top-full left-full">
              <h1>{onScreenProject.title}</h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          // $slug slides up on exit (isDetailPage is true while $slug is the
          // rendered child, so its retained exit variant is the slide); other
          // routes just fade.
          exit={
            isDetailPage
              ? { y: -80, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
              : { opacity: 0, transition: { duration: 0.3 } }
          }
          transition={{ duration: 0.3 }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
