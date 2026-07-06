import { motion } from "motion/react";
import type { ComponentType } from "react";
import { NavLink, useLocation } from "react-router";
import HomeGraphic from "~/assets/graphics/home.svg?react";
import AboutGraphic from "~/assets/graphics/about.svg?react";
import ProjectsGraphic from "~/assets/graphics/projects.svg?react";

type NavItem = {
  title: string;
  to: string;
  Graphic: ComponentType;
  parentClassName: string;
  graphicClassName: string;
};

const navItems: NavItem[] = [
  {
    title: "Home",
    to: "/",
    Graphic: HomeGraphic,
    parentClassName: "pl-3 pr-1 pb-1",
    graphicClassName: "*:fill-black",
  },
  {
    title: "About",
    to: "/about",
    Graphic: AboutGraphic,
    parentClassName: "pl-2 pt-1 pr-1 pb-1",
    graphicClassName: "*:fill-black",
  },
  {
    title: "Projects",
    to: "/projects",
    Graphic: ProjectsGraphic,
    parentClassName: "pl-2 pt-1 pr-1 pb-1",
    graphicClassName: "*:fill-black",
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
        filter: `blur(${distance}px)`,
        opacity: 1 - 0.2 * distance,
      }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <NavLink
          to={item.to}
          className={`block w-fit *:w-full *:transition *:fill-black *:overflow-visible h-fit ${item.parentClassName}`}
        >
          <div className={`w-full ${item.graphicClassName}`}>
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

  return (
    <div className="w-96 flex">
      {navItems.map((item, index) => (
        <NavItem
          key={item.to}
          item={item}
          distance={Math.abs(activeIndex - index)}
        />
      ))}
    </div>
  );
}
