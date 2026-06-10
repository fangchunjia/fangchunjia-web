import { useEffect, useRef } from "react";
import { Outlet, useMatches } from "react-router";
import { useStore } from "@nanostores/react";
import { motion, useMotionValue } from "motion/react";
import { $activeProject, $hoveredProject, $scrollY } from "~/stores/ui";
import Screen from "~/components/Screen";

export default function ProjectsLayout() {
  const matches = useMatches();
  const isDetailPage = matches.some(
    (match) => match.id === "routes/_layout.projects.$slug",
  );
  const galleryWrapperRef = useRef<HTMLDivElement>(null);
  const hoveredProject = useStore($hoveredProject);
  const activeProject = useStore($activeProject);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
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

  // Scrolling of Gallery on /projects/$slug and restoring on /projects
  useEffect(() => {
    if (!isDetailPage) {
      if (galleryWrapperRef.current)
        galleryWrapperRef.current.style.transform = "";
      $scrollY.set(0);
      return;
    }
    return $scrollY.listen((y) => {
      if (!galleryWrapperRef.current) return;
      const maxTranslate = window.innerHeight - 32;
      galleryWrapperRef.current.style.transform = `translateY(-${Math.min(y, maxTranslate)}px)`;
    });
  }, [isDetailPage]);

  return (
    <>
      <motion.div
        ref={galleryWrapperRef}
        className="fixed inset-0 overflow-hidden project-image"
        style={{ viewTransitionName: "gallery-screen" } as React.CSSProperties}
        initial={{
          height: "100dvh",
        }}
      >
        <Screen item={displayItem} isDetailPage={isDetailPage} />
      </motion.div>
      {/* {onScreenProject && (
        <div className="">
          <ProjectTitle project={onScreenProject} />
        </div>
      )} */}
      {onScreenProject && (
        <motion.div
          initial={{ filter: "blur(2px)" }}
          animate={{
            filter: isDetailPage ? "blur(0px)" : "blur(2px)",
            opacity: isDetailPage ? 1 : 0.8,
            backgroundColor: isDetailPage
              ? "var(--color-fangchunjia-gray)"
              : "none",
            transition: { duration: 1 },
          }}
          style={{
            top: 0,
            left: 0,
            x: cursorX,
            y: cursorY,
            viewTransitionName: "project-title",
          }}
          className="font-medium text-lg mb-0 py-0 fixed z-1000 text-accent"
        >
          <motion.div className="pointer-events-none top-full left-full">
            <h1>{onScreenProject.title}</h1>
          </motion.div>
        </motion.div>
      )}
      <div
        style={{ viewTransitionName: "projects-outlet" } as React.CSSProperties}
      >
        <Outlet />
      </div>
    </>
  );
}
