import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { useStore } from "@nanostores/react";
import FlirtGraphic from "~/assets/graphics/flirt.svg?react";
import { $isFlirtActivated, $flirtEl } from "~/stores/ui";

// Scroll effects to experiment with. Temporary switcher widget below — remove
// once we settle on one.
const EFFECTS = ["blur", "squeeze", "opacity", "shadow", "none"] as const;
type Effect = (typeof EFFECTS)[number];

// Minimum vertical scale for the squeeze effect, so it stops here instead of
// collapsing all the way to 0 and disappearing.
const SQUEEZE_MIN = 0.24;

// Minimum opacity for the opacity effect, so it fades to here instead of
// disappearing entirely.
const OPACITY_MIN = 0.24;

export default function Flirt() {
  const isActivated = useStore($isFlirtActivated);
  const ref = useRef<SVGSVGElement>(null);

  // Selected effect drives the widget UI; mirror it into a ref so the Lenis
  // scroll callback reads the latest choice without re-subscribing every switch.
  const [effect, setEffect] = useState<Effect>("blur");
  const effectRef = useRef(effect);
  effectRef.current = effect;

  // Publish the graphic node so Cover can measure its rect and mask its exiting
  // video to the exact Flirt shape/position.
  useEffect(() => {
    $flirtEl.set(ref.current);
    return () => $flirtEl.set(null);
  }, []);

  // Drive the squeeze straight onto the node from Lenis's scroll callback (0→1
  // progress) to avoid a React re-render on every scroll frame.
  useLenis(({ scroll }) => {
    if (ref.current) {
      // Squeeze the graphic in height as the page scrolls: the top edge stays
      // put (transform-origin: top) while the bottom rises toward it. Progress
      // is measured against a single viewport height, so the graphic is fully
      // collapsed once the initially-visible content has scrolled off. An
      // unscrollable page keeps scroll at 0, so it stays full height.
      const p = Math.min(Math.max(scroll / window.innerHeight, 0), 1);
      const base = isActivated ? "url(#flirt-inner-shadow)" : "";
      // Apply the active effect and reset the other so switching leaves no
      // leftover blur/scale behind.
      if (effectRef.current === "blur") {
        // Keep the inner-shadow filter first, then chain the scroll-driven blur.
        ref.current.style.filter = `${base} blur(${p * 32}px)`;
        ref.current.style.transform = "";
        ref.current.style.opacity = "";
      } else if (effectRef.current == "squeeze") {
        // Squeeze the graphic vertically as it collapses: scaleY shrinks from 1
        // toward SQUEEZE_MIN (never 0, so it doesn't vanish) while origin-top
        // (see className) pins the top edge in place.
        ref.current.style.transform = `scaleY(${1 - p * (1 - SQUEEZE_MIN)})`;
        ref.current.style.filter = base;
        ref.current.style.opacity = "";
      } else if (effectRef.current == "opacity") {
        // Fade the graphic from 1 toward OPACITY_MIN (never 0, so it doesn't
        // disappear) as the page scrolls.
        ref.current.style.opacity = `${1 - p * (1 - OPACITY_MIN)}`;
        ref.current.style.filter = base;
        ref.current.style.transform = "";
      } else if (effectRef.current == "shadow") {
        // Apply the inner-shadow filter once scrolled past 20% of the viewport
        // height (OR'd with isActivated), with no gradual transition.
        const shadowed = isActivated || p > 0.2;
        ref.current.style.filter = shadowed ? "url(#flirt-inner-shadow)" : "";
        ref.current.style.transform = "";
        ref.current.style.opacity = "";
      } else if (effectRef.current == "none") {
        ref.current.style.filter = base;
        ref.current.style.transform = "";
        ref.current.style.opacity = "";
      }
    }
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-flirt flex *:m-auto *:max-h-[80%] *:fill-fangchunjia-gray">
      {/* Inner-shadow filter: punch the shape out of a blurred, offset copy of
          itself, fill the resulting rim with --color-accent, then paint it back
          over the graphic. CSS var must go through flood-color (a CSS property),
          not a presentation attribute. Then replace the graphic's own fill with
          white @ 20% alpha, clipped to the shape, and paint the rim over it. */}
      {(isActivated || effect === "shadow") && (
        <svg width="0" height="0" aria-hidden className="absolute">
          <defs>
            <filter id="flirt-inner-shadow">
              <feOffset dx="-8" dy="-8" />
              <feGaussianBlur stdDeviation="4" result="offsetBlur" />
              <feComposite
                operator="out"
                in="SourceGraphic"
                in2="offsetBlur"
                result="inverse"
              />
              <feFlood
                style={{ floodColor: "var(--accent-shadow)" }}
                floodOpacity={0.72}
                result="color"
              />
              <feComposite
                operator="in"
                in="color"
                in2="inverse"
                result="shadow"
              />
              <feFlood
                floodColor="#fff"
                floodOpacity={0.1}
                result="fillColor"
              />
              <feComposite
                operator="in"
                in="fillColor"
                in2="SourceGraphic"
                result="fill"
              />
              <feComposite operator="over" in="shadow" in2="fill" />
            </filter>
          </defs>
        </svg>
      )}

      <FlirtGraphic
        ref={ref}
        className="origin-top"
        style={{
          filter: isActivated ? "url(#flirt-inner-shadow)" : "",
          fill: isActivated ? "" : "#000",
        }}
      />

      {/* TEMP: scroll-effect switcher for experimentation — remove later. */}
      <div className="fixed bottom-3 left-3 flex bg-white text-xs pointer-events-auto">
        {EFFECTS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setEffect(name)}
            className={`px-2 py-0.5 ${
              effect === name ? "bg-fangchunjia-pink text-white" : "text-black"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
