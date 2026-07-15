import { useContext, useRef } from "react";
import {
  useMatches,
  useOutlet,
  UNSAFE_RouteContext as RouteContext,
  UNSAFE_DataRouterStateContext as DataRouterStateContext,
} from "react-router";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  type TargetAndTransition,
} from "motion/react";

// A page's enter/exit is described with plain objects (NOT variant labels) so
// Motion never propagates a variant label into the page's own content — pages are
// free to use their own variants without breaking this wrapper's exit.
export type PageTransition = {
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
};

const DEFAULT_TRANSITION: Required<PageTransition> = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// One Motion-owned enter/exit wrapper for an <Outlet> level. `mode="wait"` gives a
// sequential fade: the old page fades out fully, then the new one fades in.
//
// Plug-and-play: drop it at ANY outlet level (root or nested) with no props. It
// self-keys on its OWN direct child route, so a deeper navigation handled by a
// nested AnimatedOutlet doesn't also transition this level.
//
// Per-page motion, in order of precedence:
//   1. the child route's `handle.transition` (co-located with the page)
//   2. the `transition` prop (applies to every page at this outlet level)
//   3. DEFAULT_TRANSITION
export default function AnimatedOutlet({
  gate = true,
  transition,
  className,
  onExitComplete,
}: {
  // Hold the entrance until true (the root passes $coverPlayed for splash gating).
  gate?: boolean;
  // Level-wide override for this outlet's pages.
  transition?: PageTransition;
  className?: string;
  // Fires once the outgoing page's exit finishes — a good moment to reset scroll.
  onExitComplete?: () => void;
}) {
  const child = useChildMatch();
  const routeKey = child?.pathname ?? "__leaf__";
  const pageTransition = (
    child?.handle as { transition?: PageTransition } | undefined
  )?.transition;
  const t = { ...DEFAULT_TRANSITION, ...transition, ...pageTransition };

  console.log("[AO] render key=", routeKey, "className=", className);

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        console.log("[AO] onExitComplete key was", routeKey);
        onExitComplete?.();
      }}
    >
      <motion.div
        key={routeKey}
        className={className}
        initial={t.initial}
        animate={gate ? t.animate : t.initial}
        exit={t.exit}
        onAnimationStart={(d) =>
          console.log("[AO] animStart", routeKey, Math.round(performance.now()), d)
        }
        onAnimationComplete={(d) =>
          console.log(
            "[AO] animComplete",
            routeKey,
            Math.round(performance.now()),
            d,
          )
        }
      >
        <FrozenOutlet label={routeKey} />
      </motion.div>
    </AnimatePresence>
  );
}

// The match this outlet renders (one level below the route we're in). Its pathname
// changes only when THIS outlet's direct child changes — deeper changes don't move
// it — which is exactly the right transition key per level.
function useChildMatch() {
  const depth = useContext(RouteContext).matches.length;
  return useMatches()[depth];
}

// Holds the EXITING page's content + loader data during its fade, WITHOUT freezing
// the live router state while the page is still present — so nested outlets keep
// navigating. In RR's data router `useLoaderData()` reads the global state; once
// we've navigated away the leaving route's data is gone (it would crash). We serve
// live state while present and snapshot only once exiting; the ref tracks the latest
// present state so a leaving section shows its correct last sub-page.
function FrozenOutlet({ label }: { label: string }) {
  const outlet = useOutlet();
  const state = useContext(DataRouterStateContext);
  const isPresent = useIsPresent();
  const lastPresent = useRef({ outlet, state });
  if (isPresent) lastPresent.current = { outlet, state };
  const active = isPresent ? { outlet, state } : lastPresent.current;
  console.log(
    "[FO]",
    label,
    "isPresent=",
    isPresent,
    "outletNull=",
    active.outlet == null,
  );
  return (
    <DataRouterStateContext.Provider value={active.state}>
      {active.outlet}
    </DataRouterStateContext.Provider>
  );
}
