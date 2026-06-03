import { useEffect, useRef, useState } from "react";
import {
  Outlet,
  useLocation,
  useMatches,
  useRouteLoaderData,
} from "react-router";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { urlFor } from "~/lib/sanity";
import Header from "~/components/Header";
import ProjectTitle from "~/components/ProjectTitle";
import Purikura from "~/components/Purikura";
import Quote from "~/components/Quote";
import { $activeProject, $hoveredProject, $scrollY } from "~/stores/ui";
import Screen from "~/components/Screen";
import Back from "~/components/Back";

export function ProjectsLayout() {
  const matches = useMatches();
  const isDetailPage = matches.some(
    (match) => match.id === "routes/_layout.projects.$slug",
  );
  const galleryWrapperRef = useRef<HTMLDivElement>(null);
  const hoveredProject = useStore($hoveredProject);
  const activeProject = useStore($activeProject);

  // Scrolling of Gallery on /projects/$slug and restoring on /projects
  // useEffect(() => {
  //   if (!isDetailPage) {
  //     if (galleryWrapperRef.current)
  //       galleryWrapperRef.current.style.transform = "";
  //     $scrollY.set(0);
  //     return;
  //   }
  //   return $scrollY.listen((y) => {
  //     if (!galleryWrapperRef.current) return;
  //     const maxTranslate = window.innerHeight - 32;
  //     galleryWrapperRef.current.style.transform = `translateY(-${Math.min(y, maxTranslate)}px)`;
  //   });
  // }, [isDetailPage]);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const isFollowingRef = useRef(true);

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

  return (
    <>
      <motion.div
        ref={galleryWrapperRef}
        className="fixed top-0 left-0 right-0 overflow-hidden project-image"
        style={{ viewTransitionName: "gallery-screen" } as React.CSSProperties}
        initial={{
          height: "100dvh",
        }}
        // Comment out Screen following the scroll
        // animate={{
        //   height: isDetailPage ? "calc(100dvh - 32px)" : "100dvh",
        // }}
        // transition={
        //   isDetailPage
        //     ? { duration: 1, delay: 0.5, ease: [0.76, 0, 0.24, 1] }
        //     : { duration: 0 }
        // }
      >
        <Screen item={displayItem} />
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
            transition: { duration: 1 },
          }}
          style={{
            top: 0,
            left: 0,
            x: cursorX,
            y: cursorY,
            viewTransitionName: "project-title",
            color: onScreenProject.accentColor.hex,
          }}
          className="font-medium text-lg mb-0 py-0 fixed z-1000"
        >
          <motion.div className="pointer-events-none top-full left-full">
            <h1>{onScreenProject.title}</h1>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

export default function Layout({ pathname }: { pathname: string }) {
  const [isPurikuraVisible, setIsPurikuraVisible] = useState<boolean>(false);

  const navItems = [
    { title: "Home", to: "/", id: "home" },
    { title: "About", to: "/about", id: "about" },
    { title: "Projects", to: "/projects", id: "projects" },
  ];

  return (
    <>
      <ProjectsLayout />
      <Header
        navItems={navItems}
        pathname={pathname}
        onClickBranding={() => setIsPurikuraVisible(!isPurikuraVisible)}
      />
      {isPurikuraVisible && <Purikura />}
      <Quote />

      <main
        className="w-full h-full"
        style={{ viewTransitionName: "outlet" } as React.CSSProperties}
      >
        <Outlet />
      </main>
    </>
  );
}
