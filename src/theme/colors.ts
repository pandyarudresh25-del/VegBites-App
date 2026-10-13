/**
 * VegBites colour system.
 *
 * The eight brand colours below are the ONLY raw colours in the app. Every
 * other token is an alpha tint of one of them, so a palette change here
 * propagates everywhere and nothing can silently drift off-brand.
 *
 *   #E85D24 primary      #C84A18 primaryDark   #287849 success
 *   #FBF8F2 background   #FFFFFF surface       #F4ECE1 sand
 *   #2B211C ink          #786A60 muted
 *
 * Deliberate mapping note: the brief's palette contains no red, so `error`
 * uses the deep brand orange (#C84A18) and `success` uses the brand green
 * (#287849). This keeps the palette closed at eight colours.
 */

/** The eight mandated brand colours — do not add to this list. */
export const palette = {
  primary: '#E85D24',
  primaryDark: '#C84A18',
  success: '#287849',
  background: '#FBF8F2',
  surface: '#FFFFFF',
  sand: '#F4ECE1',
  ink: '#2B211C',
  muted: '#786A60',
} as const;

/**
 * Adds an alpha channel to a hex colour: `withAlpha(palette.ink, 0.08)`.
 * Used to derive borders, soft fills and overlays from the base palette.
 */
export function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  const expanded =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  const int = parseInt(expanded, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  // Round to 3 decimals to keep style objects stable across renders.
  const a = Math.round(alpha * 1000) / 1000;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const Colors = {
  // --- brand ---------------------------------------------------------------
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  /** Tinted brand wash for selected rows, offer strips, soft badges. */
  primarySoft: withAlpha(palette.primary, 0.12),
  success: palette.success,
  successSoft: withAlpha(palette.success, 0.12),
  /** Deep orange doubles as the palette's danger colour (no red in brand). */
  error: palette.primaryDark,
  warning: palette.primary,

  // --- surfaces ------------------------------------------------------------
  background: palette.background,
  surface: palette.surface,
  surfaceSecondary: palette.sand,
  /** Highlight fill for pills / selected states. */
  surfaceHighlight: palette.sand,
  /** Raised surface for bottom sheets and floating bars. */
  surfaceElevated: palette.surface,

  // --- text ----------------------------------------------------------------
  text: palette.ink,
  textSecondary: palette.muted,
  /** Softer than secondary — captions, timestamps, helper text. */
  textMuted: withAlpha(palette.muted, 0.72),

  // --- lines ---------------------------------------------------------------
  border: withAlpha(palette.muted, 0.22),
  borderStrong: withAlpha(palette.muted, 0.38),
  divider: withAlpha(palette.muted, 0.16),

  // --- misc ----------------------------------------------------------------
  overlay: withAlpha(palette.ink, 0.45),
  /** Transparent — never a literal `'transparent'` scattered in screens. */
  transparent: 'rgba(0,0,0,0)',
  white: palette.surface,
} as const;

export type ColorToken = keyof typeof Colors;
