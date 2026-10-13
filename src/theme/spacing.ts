/**
 * Spacing, radii, shadows and motion.
 *
 * The scale is 4pt-based. Existing keys (xs…xxl) are preserved because they are
 * referenced ~600 times across the app; new keys extend it.
 */
import { Platform, ViewStyle } from 'react-native';
import { Colors, withAlpha } from './colors';

export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  /** Section breaks. */
  xxxl: 40,
  /** Screen top/bottom breathing room. */
  huge: 56,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 26,
  pill: 9999,
} as const;

const shadow = (opacity: number, radius: number, offsetY: number): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: Colors.text,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation: Math.max(1, Math.round(radius / 3)) },
    // react-native-web maps shadow* onto box-shadow, but being explicit avoids
    // the "shadow* style props are deprecated" warning on web.
    web: { boxShadow: `0 ${offsetY}px ${radius}px ${withAlpha(Colors.text, opacity)}` } as ViewStyle,
    default: {
      shadowColor: Colors.text,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
  })!;

export const Shadows = {
  /** Hairline lift for list rows. */
  soft: shadow(0.05, 8, 2),
  /** Standard card. */
  medium: shadow(0.08, 16, 6),
  /** Floating bar, sheet, FAB. */
  floating: shadow(0.16, 24, 10),
  /** Bottom navigation. */
  tabBar: shadow(0.06, 18, -4),
} as const;

/** Short, spring-ish durations — quick rather than floaty. */
export const Motion = {
  instant: 120,
  fast: 200,
  base: 280,
  slow: 420,
  /** One courier stage per tick on the LIVE TRACKING screen. */
  trackingTickMs: 6000,
} as const;

/** Phone-first product: on wide web viewports we centre a max-width column. */
export const Layout = {
  phoneMaxWidth: 480,
  screenPaddingX: Spacing.lg,
  tabBarHeight: 64,
  headerHeight: 56,
} as const;
