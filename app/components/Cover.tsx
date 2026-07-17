import { useState, useRef } from "react";
import ToStartGraphic from "~/assets/graphics/start.svg?react";
import flirtMaskUrl from "~/assets/graphics/flirt.svg?url";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { $flirtEl } from "~/stores/ui";

// Two-layer mask on the exiting video: the Flirt shape (always opaque) unioned
// with a solid full-screen layer whose alpha is the `--o` custom property. At
// `--o: 1` the whole video shows; animating `--o` to 0 fades the region
// *outside* the shape away while the shape stays pinned at full opacity. The
// shape layer's size/position are set at exit from the live Flirt's measured
// rect (see `alignMaskToFlirt`) so it lands exactly on the real Flirt.
const flirtMaskStyle: React.CSSProperties = {
  ["--o" as string]: 1,
  maskImage: `url(${flirtMaskUrl}), linear-gradient(rgb(0 0 0 / var(--o)), rgb(0 0 0 / var(--o)))`,
  maskRepeat: "no-repeat, no-repeat",
  maskPosition: "center, 0 0",
  maskSize: "auto 80%, 100% 100%",
  maskComposite: "add",
  WebkitMaskImage: `url(${flirtMaskUrl}), linear-gradient(rgb(0 0 0 / var(--o)), rgb(0 0 0 / var(--o)))`,
  WebkitMaskRepeat: "no-repeat, no-repeat",
  WebkitMaskPosition: "center, 0 0",
  WebkitMaskSize: "auto 80%, 100% 100%",
  WebkitMaskComposite: "source-over",
} as React.CSSProperties;

// Size/position the shape mask layer to the live Flirt's rendered rect so the
// exiting video is clipped to the exact same shape and place as the real Flirt.
// Returns false if there's no Flirt to measure (e.g. a route without the layout).
function alignMaskToFlirt(el: HTMLDivElement): boolean {
  const flirt = $flirtEl.get();
  if (!flirt) return false;
  const r = flirt.getBoundingClientRect();
  const position = `${r.left}px ${r.top}px, 0 0`;
  const size = `${r.width}px ${r.height}px, 100% 100%`;
  el.style.setProperty("mask-position", position);
  el.style.setProperty("mask-size", size);
  el.style.setProperty("-webkit-mask-position", position);
  el.style.setProperty("-webkit-mask-size", size);
  return true;
}

// Duration/delay (seconds) knobs, kept in one place so they're easy to tune and
// the surrounding comments can describe intent, not numbers.
const ENTRANCE = {
  delay: 4, // wait after mount before the "to start" graphic appears
  fadeIn: 0, // "to start" graphic fading in
} as const;

const EXIT = {
  toStartFadeOut: 0.4, // "to start" graphic fading out
  hold: 1, // Flirt-shaped video lingering before it dissolves
  videoFade: 1, // video dissolving to expose the black Flirt beneath
  fallbackFade: 0.8, // plain full-video fade when there's no Flirt to clip to
} as const;

function CoverVideo({
  onExit,
  ref,
}: {
  // Fired when the intro is over — the video played through, or errored/failed
  // to load so we should bail out rather than get stuck on a black screen.
  onExit: () => void;
  ref?: React.Ref<HTMLVideoElement>;
}) {
  return (
    <video
      ref={ref}
      className="w-full h-full object-cover"
      autoPlay
      muted
      playsInline
      preload="auto"
      poster="https://image.mux.com/e3GC55qNEuxgtjryZKO9CghBejRZfnhsNSzfQwP4ZuA/thumbnail.webp?width=1920&time=0"
      onEnded={onExit}
      onError={onExit}
    >
      <source
        src="https://stream.mux.com/e3GC55qNEuxgtjryZKO9CghBejRZfnhsNSzfQwP4ZuA/highest.mp4"
        type="video/mp4"
      />
    </video>
  );
}

export default function Cover() {
  const container = useRef<HTMLDivElement | null>(null);
  const entranceTl = useRef<GSAPTimeline | null>(null);
  const video = useRef<HTMLDivElement | null>(null);
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const toStart = useRef<HTMLDivElement | null>(null);
  // Exit has begun: set by `onExit` when the video plays through / errors, or
  // the user clicks "to start". Kicks off the exit timeline (the `[end]` useGSAP
  // below).
  const [end, setEnd] = useState(false);
  // The whole exit has finished (end of the exit timeline, or the no-Flirt
  // fallback fade): unmounts Cover entirely, so the black Flirt + gray backdrop
  // vanish at once, handing off to the real page underneath.
  const [complete, setComplete] = useState(false);
  // Movement-driven hover for the "to start" graphic: CSS `:hover` would fire
  // the instant the button fades in under an already-stationary cursor, so the
  // default green would never show. Gate the white state on a real mouse *move*
  // instead, and reset on leave.
  const [toStartHovered, setToStartHovered] = useState(false);
  const onExit = () => {
    setEnd(true);
  };

  useGSAP(
    () => {
      // Respect reduced-motion: skip the whole video intro rather than autoplay
      // a full-screen clip.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setComplete(true);
        return;
      }
      entranceTl.current = gsap.timeline().to(
        toStart.current,
        {
          opacity: 1,
          pointerEvents: "auto",
          duration: ENTRANCE.fadeIn,
        },
        `+=${ENTRANCE.delay}`,
      );
    },
    { scope: container },
  );

  useGSAP(() => {
    if (!end) return;

    // If exit fires before the entrance's fade-in has run (e.g. a short or
    // errored video), stop it so it can't fade "to start" back in mid-exit.
    entranceTl.current?.kill();

    // Align the shape mask to the real Flirt before animating (measured once,
    // at exit — not updated on resize). If there's no Flirt to measure, fall
    // back to a plain full-video fade so Cover never gets stuck.
    const aligned = video.current ? alignMaskToFlirt(video.current) : false;

    if (!aligned) {
      gsap
        .timeline()
        .to(toStart.current, { opacity: 0, duration: EXIT.toStartFadeOut })
        .to(
          video.current,
          {
            opacity: 0,
            duration: EXIT.fallbackFade,
            onComplete: () => setComplete(true),
          },
          "<",
        );
      return;
    }

    gsap
      .timeline()
      .to(toStart.current, { opacity: 0, duration: EXIT.toStartFadeOut })
      // Instantly clip the video to the Flirt shape (`--o: 0`), leaving the
      // Flirt-shaped video over the gray backdrop.
      .set(video.current, { "--o": 0 }, "<")
      // Hold that Flirt-shaped video, then dissolve the *video* (not the shape)
      // to expose the black Flirt beneath it. The black Flirt + gray backdrop
      // then vanish together when Cover unmounts, handing off seamlessly to the
      // real (identically-placed) black Flirt.
      .to(videoEl.current, {
        opacity: 0,
        duration: EXIT.videoFade,
        delay: EXIT.hold,
        onComplete: () => setComplete(true),
      });
  }, [end]);

  return (
    !complete && (
      <div
        className="fixed inset-0 flex z-9999 bg-fangchunjia-gray"
        ref={container}
      >
        <div
          className="w-full h-full bg-fangchunjia-black"
          ref={video}
          style={flirtMaskStyle}
        >
          <CoverVideo onExit={onExit} ref={videoEl} />
        </div>
        <div
          className="absolute inset-0 flex opacity-0 pointer-events-none"
          ref={toStart}
        >
          <button
            className="m-auto flex cursor-pointer p-24"
            onClick={onExit}
            onMouseMove={() => setToStartHovered(true)}
            onMouseLeave={() => setToStartHovered(false)}
            aria-label="Enter site"
          >
            <div
              className={`w-60 m-auto ${
                toStartHovered ? "*:fill-white" : "*:fill-fangchunjia-green"
              }`}
            >
              <ToStartGraphic />
            </div>
          </button>
        </div>
      </div>
    )
  );
}
