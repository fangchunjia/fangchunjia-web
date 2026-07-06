import { useCallback } from "react";
import { useMotionValue, useSpring } from "motion/react";

const DRIFT_SPRING = { stiffness: 150, damping: 20, mass: 0.5 };
const DRIFT_FACTOR = 0.1; // px of drift per px of cursor travel from the entry point

// Sprung 2-axis cursor drift: offset = (cursor − origin) × DRIFT_FACTOR, optionally
// capped. Returns the lagged spring values (x, y) plus imperative setters; callers
// own origin capture, event wiring, and leave behavior. Setters are stable so they
// can safely sit in effect deps.
export default function useCursorDrift(options?: { cap?: number }) {
  const cap = options?.cap;
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, DRIFT_SPRING);
  const y = useSpring(rawY, DRIFT_SPRING);

  const setFromCursor = useCallback(
    (cursor: { x: number; y: number }, origin: { x: number; y: number }) => {
      const clamp = (v: number) =>
        cap == null ? v : Math.max(-cap, Math.min(cap, v));
      rawX.set(clamp((cursor.x - origin.x) * DRIFT_FACTOR));
      rawY.set(clamp((cursor.y - origin.y) * DRIFT_FACTOR));
    },
    [rawX, rawY, cap],
  );
  const reset = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { x, y, setFromCursor, reset };
}
