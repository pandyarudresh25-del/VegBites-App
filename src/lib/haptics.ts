import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Subtle haptics for meaningful moments only — adding to the cart, placing an
 * order, confirming a handover, liking a reel.
 *
 * The browser has no vibration motor and a device can refuse the call, so every
 * helper is a guarded no-op on web and swallows rejections everywhere else. The
 * UI must never wait on a vibration.
 */
const supported = Platform.OS !== 'web';

const run = (trigger: () => Promise<void>) => {
  if (!supported) return;
  trigger().catch(() => {});
};

/** A light tap: something was picked, added or toggled. */
export const tapFeedback = () =>
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** The confirm sound of the app: order placed, handover verified. */
export const successFeedback = () =>
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
