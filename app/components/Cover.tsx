import { useState, useRef } from "react";
import ToStartGraphic from "~/assets/graphics/start.svg?react";
import { $coverPlayed } from "~/stores/ui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

function CoverVideo({ onEnded }: { onEnded: () => void }) {
  return (
    <video
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
  const toStart = useRef<HTMLDivElement | null>(null);
  const [end, setEnd] = useState(false);
  const [show, setShow] = useState(true);
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
          "+=3",
        );
    },
    { scope: container },
  );

  useGSAP(() => {
    if (end === true) {
      exitTl.current = gsap
        .timeline()
        .to(toStart.current, { opacity: 0 })
        .to(
          video.current,
          {
            opacity: 0,
            onComplete: () => {
              if (end === true) {
                setComplete(true);
                $coverPlayed.set(true);
              }
            },
          },
          "<",
        );
    }
  }, [end]);

  return (
    !complete && (
      <div
        className="fixed inset-0 flex bg-fangchunjia-gray z-9999"
        ref={container}
      >
        <div className="w-full h-full" ref={video}>
          <CoverVideo onEnded={onEnded} />
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
