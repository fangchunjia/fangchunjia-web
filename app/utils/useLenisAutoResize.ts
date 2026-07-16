import { useEffect, type RefObject } from "react";
import { useLenis } from "lenis/react";

// Lenis caches its scroll `limit` and only recomputes when its internal
// ResizeObserver fires. In `root` mode Lenis observes document.documentElement
// (its default `content`), but a ResizeObserver on the root <html> element is
// unreliable for content-driven height changes — it often doesn't fire when a
// descendant grows asynchronously (grid images decoding, fonts swapping), so
// the cached limit goes stale and the page won't scroll to the true bottom.
// Observe the route's actual in-flow content (the <article>) instead and call
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
