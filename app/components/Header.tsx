import { AnimatePresence, motion } from "motion/react";
import Branding from "./Branding";
import Nav from "./Nav";
import { useLocation } from "react-router";

export interface NavItem {
  title: string;
  id: string;
  to: string;
}

export default function Header({
  navItems,
  onClickBranding,
  pathname,
}: {
  navItems: NavItem[];
  onClickBranding: Function;
  pathname: string;
}) {
  return (
    <div
      className="fixed z-300 flex"
      style={{ viewTransitionName: "site-header" }}
    >
      <div
        onClick={() => {
          onClickBranding();
        }}
      >
        <Branding />
      </div>
      <Nav items={navItems} pathname={pathname} />
    </div>
  );
}
