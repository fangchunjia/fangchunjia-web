// Plug-and-play text-distortion wrapper. Renders any element (default <span>)
// with the SVG warp filter applied, keeping the text as real, selectable,
// SEO-visible DOM underneath.
//
// Seeding / randomization:
//   By default the noise seed is unspecified, so each element gets its OWN seed
//   derived from React's useId() — a different wave per element, yet identical on
//   server and client (no hydration mismatch, no flash). Elements rendering a
//   randomized seed carry their own inline <filter>.
//   Pin a `seed` (in a preset or via config) to freeze one exact pattern; a
//   preset with a fixed seed reuses the single shared <filter> from
//   <DistortionDefs> instead of an inline one.
//
// Look source:
//   • preset="strong"  -> uses that preset's settings.
//   • config={{ ... }}  -> one-off bespoke settings.
//   If both are given, `preset` wins.

import {
  useId,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { DistortFilter, distortFilterId } from "./DistortionDefs";
import {
  DISTORT_PRESETS,
  type DistortConfig,
  type DistortPreset,
} from "~/lib/distortPresets";

// Deterministic string -> small int, so a per-instance useId() yields a stable,
// SSR-safe, well-spread seed (feTurbulence seeds are integers).
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 100000;
}

type DistortedTextOwnProps = {
  as?: ElementType;
  preset?: DistortPreset;
  config?: DistortConfig;
  children?: ReactNode;
};

type DistortedTextProps<T extends ElementType> = DistortedTextOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof DistortedTextOwnProps>;

export default function DistortedText<T extends ElementType = "span">({
  as,
  preset,
  config,
  children,
  style,
  ...rest
}: DistortedTextProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  const rawId = useId();
  const localId = `distortx-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  // Settings come from the named preset or the inline config.
  const source: DistortConfig | undefined = preset
    ? DISTORT_PRESETS[preset]
    : config;

  // No explicit seed => randomize per element (stable across SSR/hydration).
  const randomize = source ? source.seed === undefined : false;

  // A fixed-seed preset can reuse the one shared <filter>; anything randomized
  // or bespoke gets its own inline <filter>.
  const useShared = !!preset && !randomize;
  const filterId = source ? (useShared ? distortFilterId(preset!) : localId) : null;

  // Config for the inline path: preset/config settings with the per-instance
  // seed filled in when randomizing.
  const inlineConfig: DistortConfig | undefined =
    source && !useShared
      ? { ...source, seed: randomize ? hashSeed(rawId) : source.seed }
      : undefined;

  // Our filter wins over any incoming style.filter — applying it is the point.
  const mergedStyle: CSSProperties | undefined = filterId
    ? { ...(style as CSSProperties), filter: `url(#${filterId})` }
    : (style as CSSProperties | undefined);

  return (
    <>
      <Tag style={mergedStyle} {...rest}>
        {children}
      </Tag>
      {inlineConfig && (
        <svg
          aria-hidden="true"
          focusable="false"
          style={{ position: "absolute", width: 0, height: 0 }}
        >
          <defs>
            <DistortFilter id={localId} config={inlineConfig} />
          </defs>
        </svg>
      )}
    </>
  );
}
