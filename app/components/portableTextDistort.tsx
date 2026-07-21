// Thin adapter that lets Portable Text reuse the same <DistortedText> primitive
// as normal React text. Pass the result to <PortableText components={...}>. It
// overrides only the requested block styles (by structural role — headings /
// paragraphs) and leaves everything else on @portabletext/react's defaults.
//
// No Sanity coupling: distortion is a frontend presentation choice made here at
// render time, never stored in the content model.

import type { PortableTextComponents } from "@portabletext/react";
import type { ReactNode } from "react";
import DistortedText from "./DistortedText";
import type { DistortConfig, DistortPreset } from "~/lib/distortPresets";

type BlockStyle = "normal" | "h1" | "h2" | "h3";

const BLOCK_TAG: Record<BlockStyle, "p" | "h1" | "h2" | "h3"> = {
  normal: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

export function distortComponents({
  preset,
  config,
  blocks = ["h1", "h2"],
}: {
  preset?: DistortPreset;
  config?: DistortConfig;
  blocks?: BlockStyle[];
}): PortableTextComponents {
  const block: Record<string, (props: { children?: ReactNode }) => ReactNode> = {};

  for (const style of blocks) {
    block[style] = ({ children }) => (
      <DistortedText as={BLOCK_TAG[style]} preset={preset} config={config}>
        {children}
      </DistortedText>
    );
  }

  return { block };
}
