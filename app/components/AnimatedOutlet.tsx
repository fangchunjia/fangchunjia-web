import { useContext, useRef } from "react";
import {
  useOutlet,
  UNSAFE_DataRouterStateContext as DataRouterStateContext,
} from "react-router";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  type Variants,
} from "motion/react";

const DEFAULT_VARIANTS: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

// One Motion-owned enter/exit wrapper for an <Outlet> level. `mode="wait"` gives a
// sequential fade: the old page fades out fully, then the new one fades in.
// Reusable at every outlet level; `variants` lets a level customize its motion.
export default function AnimatedOutlet({
  routeKey,
  gate = true,
  variants = DEFAULT_VARIANTS,
  className,
  onExitComplete,
}: {
  // Identity for this level — when it changes, the level transitions. Choose it so
  // nested levels don't double-fire (e.g. the root keys on the first path segment).
  routeKey: string;
  // Hold the entrance until true (the root passes $coverPlayed for splash gating).
  gate?: boolean;
  variants?: Variants;
  className?: string;
  // Fires once the outgoing page's exit finishes — a good moment to reset scroll.
  onExitComplete?: () => void;
}) {
  return (
    <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
      <motion.div
        key={routeKey}
        className={className}
        variants={variants}
        initial="enter"
        animate={gate ? "center" : "enter"}
        exit="exit"
      >
        <FrozenOutlet />
      </motion.div>
    </AnimatePresence>
  );
}

// Holds the EXITING page's content + loader data during its fade, WITHOUT freezing
// the live router state while the page is still present — so nested outlets keep
// navigating. In RR's data router `useLoaderData()` reads the global state; once
// we've navigated away the leaving route's data is gone (it would crash). We serve
// live state while present and snapshot only once exiting; the ref tracks the latest
// present state so a leaving section shows its correct last sub-page.
function FrozenOutlet() {
  const outlet = useOutlet();
  const state = useContext(DataRouterStateContext);
  const isPresent = useIsPresent();
  const lastPresent = useRef({ outlet, state });
  if (isPresent) lastPresent.current = { outlet, state };
  const active = isPresent ? { outlet, state } : lastPresent.current;
  return (
    <DataRouterStateContext.Provider value={active.state}>
      {active.outlet}
    </DataRouterStateContext.Provider>
  );
}
