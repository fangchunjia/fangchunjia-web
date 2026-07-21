// Single source of truth for the SVG text-distortion look. Both normal React
// text (via <DistortedText>) and Portable Text (via distortComponents()) draw
// their warp settings from here, and <DistortionDefs> renders one shared
// <filter> per named preset. Tune the whole site by editing this file.
//
// The effect is a static feTurbulence -> feDisplacementMap chain (the same
// technique skyh1.net uses): turbulence generates a noise texture, and the
// displacement map pushes each glyph pixel by that noise. Nothing here animates.

export type DisplacementChannel = "R" | "G" | "B" | "A";

export type DistortConfig = {
  /**
   * Noise frequency as [fx, fy] (or a single value for both).
   * - fx = how fast noise varies ALONG the line. Wavelength ≈ 1/fx, so a
   *   *higher* fx makes a whole line bend into a visible wave/curve; a very low
   *   fx (long wavelength) just shifts the line uniformly and looks straight.
   * - fy = how fast noise varies DOWN the line's height. Keep this LOW so the
   *   whole line moves together (coherent curve) instead of shearing each glyph.
   */
  baseFrequency?: number | [number, number];
  /** Noise detail. 1 = one smooth wave; higher adds per-letter jitter. */
  numOctaves?: number;
  /**
   * Noise seed. OMIT (default) to randomize per element — each element gets its
   * own wave, derived SSR-safely from its id. Set a number to freeze one exact
   * pattern shared across all elements using it.
   */
  seed?: number;
  /** Displacement strength in px. Amplitude of the warp — not its shape. */
  scale?: number;
  /** Optional pre-blur (feGaussianBlur stdDeviation). 0 = crisp. */
  blur?: number;
  /** Noise character. fractalNoise = smoother; turbulence = more creased. */
  type?: "fractalNoise" | "turbulence";
  /** Noise channel driving horizontal displacement. */
  xChannelSelector?: DisplacementChannel;
  /** Noise channel driving vertical displacement (the up/down of a wavy line). */
  yChannelSelector?: DisplacementChannel;
};

// Baseline mirrors skyh1's `#n1` filter (its gentle default warp).
export const DISTORT_DEFAULTS: Required<DistortConfig> = {
  baseFrequency: 0.001,
  numOctaves: 5,
  seed: 190946,
  scale: 15,
  blur: 0,
  type: "fractalNoise",
  xChannelSelector: "R",
  yChannelSelector: "R",
};

// Named looks. Add or retune here and every call site follows.
export const DISTORT_PRESETS = {
  // Barely-there ripple — good for body copy / rich text.
  subtle: { scale: 8 },
  // Pronounced liquid warp — good for headings and list titles.
  strong: { scale: 30 },
  // Whole lines bend into a smooth curve. The key is fx > fy: a wave that
  // spans the line horizontally (fx ≈ 0.004 → ~250px wavelength) while staying
  // vertically coherent (tiny fy), with a single octave so it's a smooth curve
  // rather than per-letter jitter. Raise fx for more humps, `scale` for taller
  // waves. yChannelSelector "G" decouples the vertical wave from horizontal drift.
  wavy: {
    type: "fractalNoise",
    baseFrequency: [0.002, 0.0008],
    numOctaves: 1,
    scale: 35,
    yChannelSelector: "G",
  },
} satisfies Record<string, DistortConfig>;

export type DistortPreset = keyof typeof DISTORT_PRESETS;

// Merge a preset (or raw config) onto the defaults into a fully-resolved config.
export function resolveDistortConfig(
  config?: DistortConfig,
): Required<DistortConfig> {
  return { ...DISTORT_DEFAULTS, ...config };
}
