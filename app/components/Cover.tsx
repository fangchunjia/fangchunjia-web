import { useState, useRef } from "react";
import ToStartGraphic from "./graphics/ToStartGraphic";
import { $coverPlayed } from "~/stores/ui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

function CoverVideo({ onEnded }: { onEnded: () => void }) {
  // useEffect(() => {
  //   // Safety net: dismiss even if autoplay is blocked or the file stalls.
  //   // const t = setTimeout(onEnded, 4000);
  //   // return () => clearTimeout(t);
  // }, [onEnded]);

  return (
    <video
      className=""
      autoPlay
      muted
      playsInline
      preload="auto"
      poster="https://image.mux.com/e3GC55qNEuxgtjryZKO9CghBejRZfnhsNSzfQwP4ZuA/thumbnail.png?time=0"
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
        .from(video.current, {
          opacity: 0,
          duration: 1.2,
          delay: 0.4,
        })
        .from(
          toStart.current,
          {
            opacity: 0,
            pointerEvents: "none",
          },
          "+=4",
        );
    },
    { scope: container },
  );

  useGSAP(() => {
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
  }, [end]);

  return (
    !complete && (
      <div className="fixed inset-0 flex bg-[#e7e7e7] z-9999" ref={container}>
        <div className="m-auto w-160" ref={video}>
          <CoverVideo onEnded={onEnded} />
        </div>
        <div className="absolute inset-0 flex" ref={toStart}>
          <button
            className="m-auto *:fill-[#5EFF00] w-160 h-90 flex cursor-pointer hover:*:fill-[#ffffff]"
            onClick={onEnded}
          >
            <div className="w-60 m-auto">
              <ToStartGraphic />
            </div>
          </button>
        </div>
      </div>
    )
  );
}
