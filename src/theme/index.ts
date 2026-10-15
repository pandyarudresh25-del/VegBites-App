/**
 * Theme barrel. `Theme` is the single import used by screens.
 *
 * All keys that existed before the UI overhaul are preserved
 * (`colors`, `typography`, `spacing`, `borderRadius`, `shadows`); motion,
 * layout and gradients are additive.
 */
import { Colors, palette, states, withAlpha } from './colors';
import { Typography, FontWeight } from './typography';
import { Spacing, BorderRadius, Shadows, Motion, Layout } from './spacing';

export { Colors, palette, states, withAlpha, Typography, FontWeight, Spacing, BorderRadius, Shadows, Motion, Layout };

export const Gradients = {
  /** Primary CTA / header wash. */
  brand: [Colors.primary, Colors.primaryDark] as const,
  /** Faint page-background wash used behind hero sections. */
  hero: [withAlpha(Colors.primary, 0.12), Colors.background] as const,
  /** Dark scrim for text over imagery (reels, hero photos). */
  scrim: ['rgba(0,0,0,0)', withAlpha(Colors.text, 0.72)] as const,
} as const;

export const Theme = {
  colors: Colors,
  palette,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  motion: Motion,
  layout: Layout,
  gradients: Gradients,
} as const;

export type ThemeType = typeof Theme;
