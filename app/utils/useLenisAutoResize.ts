import { useEffect, type RefObject } from "react";
import { useLenis } from "lenis/react";

// Lenis caches its scroll `limit` and only recomputes when its internal
// ResizeObserver fires. In `root` mode that observer (and any observer on
// document.body / documentElement) is useless here because app.css pins both
// html and body to `height: 100dvh` — their boxes never grow. The route's
// in-flow content (the <article>) is what actually overflows and grows when
// grid images decode or fonts swap. Observe that element and call
// lenis.resize(), which recomputes the limit from documentElement.scrollHeight
// (correct, since scrollHeight always includes overflowing content).
export function useLenisAutoResize(ref: RefObject<HTMLElement | null>) {
  const lenis = useLenis();
  useEffect(() => {
    const el = ref.current;
    if (!lenis || !el) return;
    const ro = new ResizeObserver(() => lenis.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [lenis, ref]);
}
