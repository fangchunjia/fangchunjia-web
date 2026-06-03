import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import ToStartGraphic from "./graphics/ToStartGraphic";

function CoverVideo({ onEnded }: { onEnded: () => void }) {
  useEffect(() => {
    // Safety net: dismiss even if autoplay is blocked or the file stalls.
    // const t = setTimeout(onEnded, 4000);
    // return () => clearTimeout(t);
  }, [onEnded]);

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

export default function Cover({ onPlayed }: { onPlayed: () => void }) {
  const [show, setShow] = useState(true);
  const onEnded = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-9999 bg-[#e7e7e7]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CoverVideo onEnded={onEnded} />
          <div className="absolute inset-0 flex">
            <div className="m-auto w-60 *:fill-[#5EFF00]">
              <ToStartGraphic />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
