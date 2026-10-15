/**
 * VegBites colour system.
 *
 * The eight brand colours below are the ONLY raw colours in the app. Every
 * other token is an alpha tint of one of them, so a palette change here
 * propagates everywhere and nothing can silently drift off-brand.
 *
 *   #E85D24 primary      #C84A18 primaryDark   #287849 green
 *   #FBF8F2 background   #FFFFFF surface       #F4ECE1 sand
 *   #2B211C ink          #786A60 muted
 *
 * The brand's approved semantic state colours are defined once below
 * (`states`) and referenced everywhere - screens must never hardcode them:
 *
 *   #E9DED2 border       #2F8A57 success      #D99A26 warning
 *   #D94841 error        #3978D4 info         #C8BFB4 disabled
 *   rgba(43,33,28,0.45) overlay
 */

/** The eight mandated brand colours — do not add to this list. */
export const palette = {
  primary: '#E85D24',
  primaryDark: '#C84A18',
  green: '#287849',
  background: '#FBF8F2',
  surface: '#FFFFFF',
  sand: '#F4ECE1',
  ink: '#2B211C',
  muted: '#786A60',
} as const;

/**
 * Approved non-brand values from the locked palette: semantic states, the border
 * tint and the disabled grey. Kept separate from `palette` so the brand accents
 * stay obvious, but equally locked - do not edit these values.
 */
export const states = {
  border: '#E9DED2',
  success: '#2F8A57',
  warning: '#D99A26',
  error: '#D94841',
  info: '#3978D4',
  disabled: '#C8BFB4',
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
  success: states.success,
  successSoft: withAlpha(states.success, 0.12),
  /** Destructive / failure states. Distinct from the brand accents by design. */
  error: states.error,
  errorSoft: withAlpha(states.error, 0.12),
  warning: states.warning,
  warningSoft: withAlpha(states.warning, 0.12),
  info: states.info,
  infoSoft: withAlpha(states.info, 0.12),
  /** Disabled controls and text. */
  disabled: states.disabled,

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
  border: states.border,
  borderStrong: withAlpha(palette.muted, 0.42),
  divider: withAlpha(states.border, 0.7),

  // --- misc ----------------------------------------------------------------
  overlay: withAlpha(palette.ink, 0.45),
  /** Transparent — never a literal `'transparent'` scattered in screens. */
  transparent: 'rgba(0,0,0,0)',
  white: palette.surface,
} as const;

export type ColorToken = keyof typeof Colors;
