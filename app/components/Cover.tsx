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

function CoverVideo({
  onEnded,
  ref,
}: {
  onEnded: () => void;
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
      onEnded={onEnded}
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
  const exitTl = useRef<GSAPTimeline | null>(null);
  const video = useRef<HTMLDivElement | null>(null);
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const toStart = useRef<HTMLDivElement | null>(null);
  const [end, setEnd] = useState(false);
  const [show, setShow] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [complete, setComplete] = useState(false);
  const onEnded = () => {
    setEnd(true);
  };
  useGSAP(
    () => {
      entranceTl.current = gsap
        .timeline()
        // .to(video.current, {
        //   opacity: 1,
        //   duration: 1.2,
        //   // delay: 0.4,
        // })
        .to(
          toStart.current,
          {
            opacity: 1,
            pointerEvents: "auto",
          },
          "+=4",
        );
    },
    { scope: container },
  );

  useGSAP(() => {
    if (end === true) {
      // Align the shape mask to the real Flirt before animating. If there's no
      // Flirt to measure, fall back to a plain full-video fade so Cover never
      // gets stuck.
      const aligned = video.current ? alignMaskToFlirt(video.current) : false;

      if (!aligned) {
        exitTl.current = gsap
          .timeline()
          .to(toStart.current, { opacity: 0, duration: 0.3 })
          .to(
            video.current,
            {
              opacity: 0,
              duration: 0.8,
              onComplete: () => {
                if (end === true) {
                  setComplete(true);
                }
              },
            },
            "<",
          );
        return;
      }

      exitTl.current = gsap
        .timeline()
        .to(toStart.current, { opacity: 0, duration: 0.3 })
        // Phase 1: fade the video away everywhere except the Flirt shape (~0.8s),
        // then reveal the pages underneath and let them take pointer events.
        .to(
          video.current,
          {
            "--o": 0,
            duration: 0,
            onComplete: () => setRevealed(true),
          },
          "<",
        )
        // Phase 2+3: hold the Flirt-shaped video for 2s, then fade the *video*
        // out (not the shape), revealing the black Flirt beneath it. The black
        // Flirt + gray backdrop then vanish together when Cover unmounts,
        // handing off seamlessly to the real (identically-placed) black Flirt.
        .to(videoEl.current, {
          opacity: 0,
          duration: 1,
          delay: 1,
          onComplete: () => {
            if (end === true) {
              setComplete(true);
            }
          },
        });
    }
  }, [end]);

  return (
    !complete && (
      <div
        className={`fixed inset-0 flex z-9999 bg-fangchunjia-gray ${
          revealed ? "pointer-events-none" : ""
        }`}
        ref={container}
      >
        <div
          className="w-full h-full bg-fangchunjia-black"
          ref={video}
          style={flirtMaskStyle}
        >
          <CoverVideo onEnded={onEnded} ref={videoEl} />
        </div>
        <div
          className="absolute inset-0 flex opacity-0 pointer-events-none"
          ref={toStart}
        >
          <button
            className="m-auto flex cursor-pointer p-24 group"
            onClick={onEnded}
          >
            <div className="w-60 m-auto *:fill-fangchunjia-green group-hover:*:fill-white">
              <ToStartGraphic />
            </div>
          </button>
        </div>
      </div>
    )
  );
}
