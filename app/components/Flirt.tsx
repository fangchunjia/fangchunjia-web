import { useRef } from "react";
import { useLenis } from "lenis/react";
import { useStore } from "@nanostores/react";
import FlirtGraphic from "~/assets/graphics/flirt.svg?react";
import { $isFlirtActivated } from "~/stores/ui";

export default function Flirt() {
  const isActivated = useStore($isFlirtActivated);
  const ref = useRef<SVGSVGElement>(null);

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
      // Keep the inner-shadow filter first, then chain the scroll-driven blur.
      ref.current.style.filter = `url(#flirt-inner-shadow) blur(${p * 32}px)`;
    }
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-99 flex *:m-auto *:max-h-[80%]">
      {/* Inner-shadow filter: punch the shape out of a blurred, offset copy of
          itself, fill the resulting rim with --color-accent, then paint it back
          over the graphic. CSS var must go through flood-color (a CSS property),
          not a presentation attribute. */}
      {/* Replace the graphic's own fill with white @ 20% alpha, clipped to
                the shape, then paint the shadow rim over it. */}
      {/* <FlirtGraphic /> */}
      <div className="fixed inset-0 pointer-events-none z-9999 flex *:m-auto *:max-h-[80%] *:fill-fangchunjia-gray">
        {isActivated && (
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
                  style={{ floodColor: "var(--color-accent)" }}
                  floodOpacity={0.75}
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
      </div>
    </div>
  );
}
