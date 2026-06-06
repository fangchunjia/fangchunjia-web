import { AnimatePresence, motion } from "motion/react";
import useProgressBar from "~/hooks/useProgressBar";

export default function ProgressBar() {
  const { progress, visible } = useProgressBar();

  return (
    <div className="fixed z-9999 bottom-0 inset-x-0 h-1 [mix-blend-mode:difference]">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="h-1 bg-white pointer-events-none"
            style={{ width: `${progress}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, width: `${progress}%` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
