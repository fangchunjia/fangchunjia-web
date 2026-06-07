import { motion } from "motion/react";
import type { NavProps } from "./Nav";
import { NavLink, useLocation } from "react-router";
import HomeGraphic from "./graphics/HomeGraphic";
import AboutGraphic from "./graphics/AboutGraphic";
import ProjectsGraphic from "./graphics/ProjectsGraphic";

const navItems = [
  { title: "Home", to: "/", id: "home" },
  { title: "About", to: "/about", id: "about" },
  { title: "Projects", to: "/projects", id: "projects" },
];

function SimpleNavItem({ item }) {
  const location = useLocation();
  const currentActiveIndex = navItems.findIndex(
    (e) => e.to === location.pathname,
  );
  const selfIndex = navItems.findIndex((e) => e.to === item.to);
  const distance = Math.abs(currentActiveIndex - selfIndex);

  return (
    <motion.div
      className="relative shrink-0 flex flex-col items-start overflow-hidden h-full"
      style={{ width: "128px" }}
      animate={{
        filter: `blur(${distance}px)`,
        opacity: distance === 0 ? 1 : 0.8,
        transition: {
          duration: 0.4,
        },
      }}
    >
      <NavLink
        to={item.to}
        className={
          "block w-fit *:w-full *:transition *:fill-accent *:overflow-visible h-10"
        }
      >
        {item.title === "Home" ? (
          <div className="w-full pl-3">
            <HomeGraphic />
          </div>
        ) : item.title === "About" ? (
          <div className="w-full pl-2 pt-1">
            <AboutGraphic />
          </div>
        ) : item.title === "Projects" ? (
          <div className="w-full pl-2 pt-1">
            <ProjectsGraphic />
          </div>
        ) : (
          <></>
        )}
      </NavLink>
    </motion.div>
  );
}

export default function SimpleNav() {
  return (
    <div>
      <div className="w-96 flex">
        <div className="flex">
          {navItems.map((item) => (
            <SimpleNavItem item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
