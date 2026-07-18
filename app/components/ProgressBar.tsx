import { motion } from "motion/react";
import useProgressBar from "~/hooks/useProgressBar";

export default function ProgressBar() {
  const { progress, visible } = useProgressBar();

  return (
    visible && (
      <div className="fixed z-chrome bottom-0 inset-0">
        {visible && (
          <motion.div
            className="h-full bg-accent opacity-10 pointer-events-none"
            style={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
          />
        )}
      </div>
    )
  );
}
