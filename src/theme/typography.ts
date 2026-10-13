/**
 * Type scale.
 *
 * No font binaries ship with the project, so the premium feel comes from
 * weight / size / letter-spacing / line-height discipline on each platform's
 * system face rather than from a downloaded typeface.
 *
 * Keep the existing variant names — `AppText` is typed as
 * `keyof typeof Theme.typography` and 50 screens pass these literals.
 */
import { Colors } from './colors';

const REGULAR = '400' as const;
const MEDIUM = '500' as const;
const SEMIBOLD = '600' as const;
const BOLD = '700' as const;
const EXTRABOLD = '800' as const;

export const FontWeight = { REGULAR, MEDIUM, SEMIBOLD, BOLD, EXTRABOLD } as const;

export const Typography = {
  /** Hero moments: splash wordmark, big numbers. */
  display: { fontSize: 34, lineHeight: 40, fontWeight: EXTRABOLD, color: Colors.text, letterSpacing: -0.8 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: EXTRABOLD, color: Colors.text, letterSpacing: -0.6 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: BOLD, color: Colors.text, letterSpacing: -0.3 },
  h3: { fontSize: 16, lineHeight: 22, fontWeight: BOLD, color: Colors.text, letterSpacing: -0.1 },
  /** Long-form body copy. */
  body: { fontSize: 14.5, lineHeight: 22, fontWeight: MEDIUM, color: Colors.textSecondary },
  bodySmall: { fontSize: 12.5, lineHeight: 18, fontWeight: MEDIUM, color: Colors.textSecondary },
  /** Pill / badge copy. */
  label: { fontSize: 12.5, lineHeight: 16, fontWeight: BOLD, color: Colors.text, letterSpacing: 0.1 },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: SEMIBOLD, color: Colors.textMuted, letterSpacing: 0.1 },
  /** All-caps section eyebrow. */
  eyebrow: { fontSize: 11, lineHeight: 14, fontWeight: EXTRABOLD, color: Colors.textMuted, letterSpacing: 1.1 },
  button: { fontSize: 15.5, lineHeight: 20, fontWeight: BOLD, color: Colors.surface, letterSpacing: 0.1 },
  price: { fontSize: 16, lineHeight: 21, fontWeight: EXTRABOLD, color: Colors.primary, letterSpacing: -0.2 },
} as const;

export type TypographyVariant = keyof typeof Typography;
