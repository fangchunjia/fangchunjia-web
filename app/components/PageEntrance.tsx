import { motion } from "motion/react";
import { useStore } from "@nanostores/react";
import { $coverPlayed } from "~/stores/ui";

// Wraps a route's content and gates its entrance animation until the splash
// cover has finished playing. Routes use this instead of knowing about the
// cover flag themselves.
export default function PageEntrance({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const coverPlayed = useStore($coverPlayed);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={coverPlayed ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
