export default function Quote() {
  return (
    <div className="fixed z-9999 bottom-0 left-space-left pb-1">
      {/* Inner-shadow filter: punch the shape out of a blurred, offset copy of
          itself, fill the resulting rim with --color-accent, then paint it back
          over a semi-transparent white fill of the source glyphs. Same technique
          as Flirt.tsx, applied to HTML text via CSS `filter` — the rendered
          glyphs act as the SourceGraphic. */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <filter id="quote-inner-shadow">
            <feOffset dx="-1" dy="-1" />
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
            <feFlood floodColor="#fff" floodOpacity={0.1} result="fillColor" />
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

      <div
        className="text-md font-medium select-none"
        style={{ filter: "url(#quote-inner-shadow)" }}
      >
        The hands want to see, the eyes want to caress.
      </div>
    </div>
  );
}
