import { useEffect, useState } from "react";

// Reports whether the referenced element is intersecting the viewport, via a
// single IntersectionObserver. Used to gate expensive work (e.g. video playback)
// to elements the user can actually see. `rootMargin` defaults to a 200px cushion
// so playback can start just before an element scrolls into view.
export default function useInViewport(
  ref: React.RefObject<Element | null>,
  { rootMargin = "200px", threshold = 0 }: IntersectionObserverInit = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold]);

  return inView;
}
