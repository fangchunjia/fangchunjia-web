import { motion } from "motion/react";
import { urlFor } from "~/lib/sanity";

export default function Purikura() {
  return (
    <motion.img
      drag
      dragMomentum={false}
      className="fixed top-24 left-0 w-80 z-300"
      alt="Photo of Chunjia"
      src={urlFor(
        "image-eb95be5f4e8985c2a064c1aa95a3448a701cc56e-1080x1440-jpg",
      )
        .width(600)
        .height(800)
        .url()}
    />
  );
}
