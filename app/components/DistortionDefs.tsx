// Renders the SVG <filter> definitions for the text-distortion effect. Mounted
// ONCE (in root.tsx) so every distorted element on the page references the same
// shared filter by id — the way skyh1 defines `#n0/#n1/#n2` once and applies
// them via classes, rather than emitting a duplicate <filter> per element.
//
// <DistortedText preset="..."> points `filter: url(#distort-<preset>)` at these.
// The exported <DistortFilter> is also reused by <DistortedText>'s one-off
// `config` path so the filter markup lives in exactly one place.

import {
  DISTORT_PRESETS,
  resolveDistortConfig,
  type DistortConfig,
} from "~/lib/distortPresets";

/** Stable filter id for a named preset. */
export const distortFilterId = (preset: string) => `distort-${preset}`;

/** A single <filter> element (feTurbulence -> optional blur -> displacement). */
export function DistortFilter({
  id,
  config,
}: {
  id: string;
  config?: DistortConfig;
}) {
  const c = resolveDistortConfig(config);
  const [fx, fy] = Array.isArray(c.baseFrequency)
    ? c.baseFrequency
    : [c.baseFrequency, c.baseFrequency];
  const displaceIn = c.blur > 0 ? "BLURRED" : "SourceGraphic";

  return (
    // Expanded region so large scale/blur doesn't clip glyph edges.
    <filter
      id={id}
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence
        type={c.type}
        baseFrequency={`${fx} ${fy}`}
        numOctaves={c.numOctaves}
        seed={c.seed}
        result="NOISE"
      />
      {c.blur > 0 && (
        <feGaussianBlur in="SourceGraphic" stdDeviation={c.blur} result="BLURRED" />
      )}
      <feDisplacementMap
        in={displaceIn}
        in2="NOISE"
        scale={c.scale}
        xChannelSelector={c.xChannelSelector}
        yChannelSelector={c.yChannelSelector}
      />
    </filter>
  );
}

/**
 * One hidden <svg> holding a shared <filter> per FIXED-SEED preset. Mount once.
 * Presets without a seed randomize per element and render their own inline
 * <filter> (see <DistortedText>), so they'd never reference these — we skip them
 * to avoid dead defs.
 */
export default function DistortionDefs() {
  const shared = (
    Object.entries(DISTORT_PRESETS) as [string, DistortConfig][]
  ).filter(([, config]) => config.seed !== undefined);

  return (
    // NOT display:none — that breaks filter references in some browsers. Keep it
    // in flow-less, zero-size, out of the a11y tree instead.
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        {shared.map(([name, config]) => (
          <DistortFilter key={name} id={distortFilterId(name)} config={config} />
        ))}
      </defs>
    </svg>
  );
}
