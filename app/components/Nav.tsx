import { motion } from "motion/react";
import type { ComponentType } from "react";
import { Link, NavLink, useLocation } from "react-router";
import HomeGraphic from "~/assets/graphics/home.svg?react";
import AboutGraphic from "~/assets/graphics/about.svg?react";
import ProjectsGraphic from "~/assets/graphics/projects.svg?react";
import Back from "./Back";

type NavItem = {
  title: string;
  to: string;
  Graphic: ComponentType;
  parentClassName: string;
  graphicClassName: string;
};

const navItems: NavItem[] = [
  {
    title: "Projects",
    to: "/projects",
    Graphic: ProjectsGraphic,
    parentClassName: "pl-2 pt-1 pr-1 pb-1",
    graphicClassName: "*:fill-accent",
  },
  {
    title: "Home",
    to: "/",
    Graphic: HomeGraphic,
    parentClassName: "pl-3 pr-1 pb-1",
    graphicClassName: "*:fill-accent",
  },
  {
    title: "About",
    to: "/about",
    Graphic: AboutGraphic,
    parentClassName: "pl-2 pt-1 pr-1 pb-1",
    graphicClassName: "*:fill-accent",
  },
];

function NavItem({ item, distance }: { item: NavItem; distance: number }) {
  const { Graphic } = item;

  return (
    <motion.div
      className="relative shrink-0 flex flex-col items-start overflow-hidden h-full w-32"
      initial={{
        // Start with the max blur and transparency (opacity)
        filter: `blur(${navItems.length - 1}px)`,
        opacity: 0.8,
      }}
      animate={{
        filter: `blur(${distance ? 1 : 0}px)`,
        opacity: distance ? 0.8 : 1,
      }}
      transition={{ duration: 0 }}
    >
      <div>
        <NavLink
          to={item.to}
          aria-label={item.title}
          className={`block w-fit *:w-full *:transition *:fill-accent *:overflow-visible h-fit ${item.parentClassName}`}
        >
          <div className={`w-full ${item.graphicClassName}`} aria-hidden="true">
            <Graphic />
          </div>
        </NavLink>
      </div>
    </motion.div>
  );
}

export default function Nav() {
  const location = useLocation();
  const activeIndex = navItems.findIndex((e) =>
    e.to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(e.to),
  );

  // Show a back link when the current path is a child of any non-root nav item
  // (e.g. "/projects/foo"), but not on the nav item roots themselves. The back
  // link points at the parent path (the segment above the current one).
  const showBack = navItems.some(
    (e) => e.to !== "/" && location.pathname.startsWith(`${e.to}/`),
  );
  const parentPath = location.pathname.replace(/\/[^/]+\/?$/, "") || "/";

  return (
    <nav aria-label="Primary" className="w-96 flex relative">
      {navItems.map((item, index) => (
        <NavItem
          key={item.to}
          item={item}
          distance={Math.abs(activeIndex - index)}
        />
      ))}
      {showBack && (
        <div className="absolute top-0 left-[224px] text-sm">
          <Back />
        </div>
      )}
    </nav>
  );
}
