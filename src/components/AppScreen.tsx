import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { AppText } from './AppText';

/**
 * Standard screen frame.
 *
 * Phone-first: on wide web viewports the content is centred in a
 * `layout.phoneMaxWidth` column instead of stretching to 1400px, which is the
 * main responsive fix for every screen that used to be edge-to-edge.
 */
export const AppScreen: React.FC<{
  children: React.ReactNode;
  /** Column layout with gutters; set false for full-bleed screens (reels/maps). */
  padded?: boolean;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}> = ({ children, padded = true, style, edges = ['top'] }) => (
  <SafeAreaView style={[styles.safe, style]} edges={edges}>
    <View style={[styles.center, padded && styles.padded]}>{children}</View>
  </SafeAreaView>
);

/** Scrollable variant of {@link AppScreen}. */
export const AppScrollScreen: React.FC<{
  children: React.ReactNode;
  padded?: boolean;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: React.ReactNode;
}> = ({ children, padded = true, contentStyle, refreshing, onRefresh, footer }) => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={[styles.center, padded && styles.padded, { flex: 1 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  </SafeAreaView>
);

/** Back-arrow header used by every pushed (non-tab) screen. */
export const ScreenHeader: React.FC<{
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}> = ({ title, subtitle, left, right }) => (
  <View style={styles.header}>
    <View style={styles.headerSide}>{left}</View>
    <View style={styles.headerCenter}>
      <AppText variant="h2" align="center" numberOfLines={1}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" align="center" numberOfLines={1} style={{ marginTop: 2 }}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
    <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
  </View>
);

/** Consistent empty state — replaces the silent blank lists. */
export const EmptyState: React.FC<{
  title: string;
  body?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, body, action, icon }) => (
  <View style={styles.empty}>
    {icon ? <View style={styles.emptyIcon}>{icon}</View> : null}
    <AppText variant="h3" align="center">
      {title}
    </AppText>
    {body ? (
      <AppText variant="body" align="center" style={{ marginTop: Theme.spacing.sm, maxWidth: 300 }}>
        {body}
      </AppText>
    ) : null}
    {action ? <View style={{ marginTop: Theme.spacing.xl, alignSelf: 'stretch' }}>{action}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  center: { flex: 1, width: '100%', maxWidth: Theme.layout.phoneMaxWidth, alignSelf: 'center' },
  padded: { paddingHorizontal: Theme.layout.screenPaddingX },
  scrollContent: { paddingBottom: Theme.spacing.huge, gap: Theme.spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  headerSide: { width: 44, justifyContent: 'center' },
  headerCenter: { flex: 1 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.huge,
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
});
