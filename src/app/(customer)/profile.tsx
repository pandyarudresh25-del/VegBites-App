import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  SlidersHorizontal,
  Gift,
  Info,
  MapPin,
  Pencil,
  Receipt,
  RefreshCw,
  Star,
  User as UserIcon,
  Wallet,
  LogOut,
  Heart,
} from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage, LOCALES } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import { SEED_RESTAURANTS } from '../../data/catalogue';

/**
 * Profile. Shows the signed-in user, editing of name/phone, language switch,
 * and rows that all route somewhere real. Signed-out state offers sign-in.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { t, language, setLanguage, currency, date } = useLanguage();
  const label = (en: string, gu: string) => (language === 'gu' ? gu : en);
  const { user, isAuthed, signOut, updateUser, orders, subscriptions, reviews, walletBalance, favourites } = useAppStore();

  /** Kitchens the customer saved, newest first — resolved against the catalogue. */
  const savedKitchens = React.useMemo(
    () => favourites.map((id) => SEED_RESTAURANTS.find((entry) => entry.id === id)).filter(Boolean) as typeof SEED_RESTAURANTS,
    [favourites],
  );

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [confirmLogout, setConfirmLogout] = useState(false);

  const rows: { icon: typeof Receipt; label: string; sub?: string; onPress: () => void }[] = [
    { icon: Receipt, label: t('profile.myOrders'), sub: t('flow.cart.itemsCount', { count: orders.length }), onPress: () => router.push('/orders') },
    { icon: RefreshCw, label: t('profile.mySubscription'), sub: t('flow.cart.itemsCount', { count: subscriptions.length }), onPress: () => router.push('/subscription') },
    { icon: Wallet, label: t('profile.wallet'), sub: currency(walletBalance), onPress: () => router.push('/wallet') },
    { icon: Star, label: t('flow.reviews.title'), sub: t('flow.cart.itemsCount', { count: reviews.length }), onPress: () => router.push('/reviews') },
    { icon: MapPin, label: t('profile.savedAddresses'), onPress: () => router.push('/address') },
    { icon: CreditCard, label: t('flow.checkout.paymentMethod'), onPress: () => router.push('/payments') },
    { icon: Bell, label: t('profile.notifications'), onPress: () => router.push('/notifications') },
    { icon: Gift, label: t('account.loyalty'), onPress: () => router.push('/loyalty') },
    { icon: HelpCircle, label: t('profile.helpSupport'), onPress: () => router.push('/support') },
    { icon: SlidersHorizontal, label: t('account.settings'), onPress: () => router.push('/settings') },
  ];

  const handleSave = () => {
    updateUser({ name: name.trim() || user?.name, phone: phone.replace(/\D/g, '').slice(0, 10) || user?.phone });
    setEditing(false);
  };

  return (
    <AppScrollScreen contentStyle={{ gap: Theme.spacing.lg }}>
      <ScreenHeader
        title={t('profile.title') ?? t('flow.tabs.profile')}
        left={
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
            <ArrowLeft size={22} color={Theme.colors.text} />
          </Pressable>
        }
        right={
          isAuthed ? (
            <Pressable onPress={() => setEditing((e) => !e)} hitSlop={10} accessibilityLabel={t('common.edit')}>
              <Pencil size={18} color={Theme.colors.primary} />
            </Pressable>
          ) : null
        }
      />

      {/* identity */}
      <Animated.View entering={FadeInDown.duration(Theme.motion.base)} style={styles.identityCard}>
        <View style={styles.avatar}>
          <UserIcon size={26} color={Theme.colors.surface} />
        </View>

        {editing ? (
          <View style={styles.editBlock}>
            <AppText variant="caption">{t('screens.account2.editName')}</AppText>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor={Theme.colors.textMuted} />
            <AppText variant="caption" style={{ marginTop: Theme.spacing.sm }}>
              {t('screens.account2.editPhone')}
            </AppText>
            <TextInput
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
              style={styles.input}
              placeholderTextColor={Theme.colors.textMuted}
            />
            <View style={{ marginTop: Theme.spacing.md }}>
              <AppButton title={t('common.save')} onPress={handleSave} />
            </View>
          </View>
        ) : (
          <View style={styles.identityBody}>
            <AppText variant="h2">{isAuthed ? user?.name : t('profile.guestName')}</AppText>
            <AppText variant="bodySmall" style={{ marginTop: 2 }}>
              {isAuthed ? `+91 ${user?.phone}` : t('profile.guestSub')}
            </AppText>

            {isAuthed ? (
              <View style={styles.statsRow}>
                <Stat label={t('flow.cart.itemsCount', { count: orders.length })} sub={t('nav.orders')} />
                <Stat label={currency(walletBalance)} sub={t('nav.wallet')} />
                <Stat label={String(subscriptions.length)} sub={t('nav.subscriptions')} />
              </View>
            ) : (
              <View style={{ marginTop: Theme.spacing.lg }}>
                <AppButton title={t('nav.login')} onPress={() => router.push('/(auth)/login')} />
              </View>
            )}

            {isAuthed && user ? (
              <AppText variant="caption" style={{ marginTop: Theme.spacing.md }}>
                {t('screens.account2.memberSince', { date: date(user.memberSince) })} ·{' '}
                {t('screens.account2.savedSoFar', { amount: currency(user.savedTotal) })}
              </AppText>
            ) : null}
          </View>
        )}
      </Animated.View>

      {/* language switcher */}
      <View style={styles.card}>
        <View style={styles.langHeader}>
          <Globe size={17} color={Theme.colors.primary} />
          <AppText variant="h3">{t('flow.common.selectLanguage')}</AppText>
        </View>
        <View style={styles.langRow}>
          {LOCALES.map((option) => {
            const active = language === option.code;
            return (
              <Pressable
                key={option.code}
                onPress={() => setLanguage(option.code)}
                style={[styles.langChip, active && styles.langChipActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <AppText variant="label" color={active ? Theme.colors.surface : Theme.colors.text}>
                  {t(option.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* saved kitchens — written by the heart on a kitchen page */}
      <View style={styles.card}>
        <View style={styles.langHeader}>
          <Heart size={17} color={Theme.colors.primary} fill={savedKitchens.length ? Theme.colors.primary : 'transparent'} />
          <AppText variant="h3" style={{ flex: 1 }}>
            {t('screens.saved.title')}
          </AppText>
          <Pressable onPress={() => router.push('/restaurants')} hitSlop={8} accessibilityRole="button">
            <AppText variant="caption" color={Theme.colors.primary}>
              {t('screens.saved.viewAll')}
            </AppText>
          </Pressable>
        </View>

        {savedKitchens.length === 0 ? (
          <AppText variant="bodySmall" color={Theme.colors.textMuted} style={{ marginTop: Theme.spacing.sm }}>
            {t('screens.saved.empty')}
          </AppText>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.savedRow}
          >
            {savedKitchens.map((kitchen) => (
              <Pressable
                key={kitchen.id}
                onPress={() => router.push(`/restaurant/${kitchen.id}`)}
                style={styles.savedCard}
                accessibilityRole="button"
              >
                {kitchen.image ? (
                  <Image source={kitchen.image} style={styles.savedImage} />
                ) : (
                  <View style={[styles.savedImage, styles.savedFallback]} />
                )}
                <AppText variant="label" numberOfLines={1}>
                  {label(kitchen.name, kitchen.nameGu)}
                </AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>
                  {kitchen.rating} ★ · {kitchen.deliveryMins} {t('flow.common.min')}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* menu */}
      <View style={styles.menu}>
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <View key={row.label}>
              <Pressable onPress={row.onPress} style={styles.menuRow} accessibilityRole="button">
                <View style={styles.menuIcon}>
                  <Icon size={17} color={Theme.colors.primary} />
                </View>
                <AppText variant="body" color={Theme.colors.text} style={{ flex: 1 }}>
                  {row.label}
                </AppText>
                {row.sub ? <AppText variant="caption">{row.sub}</AppText> : null}
                <ChevronRight size={16} color={Theme.colors.textMuted} />
              </Pressable>
              {index < rows.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>

      {/* about + logout */}
      <View style={styles.aboutRow}>
        <Info size={14} color={Theme.colors.textMuted} />
        <AppText variant="caption" style={{ flex: 1 }}>
          {t('screens.account2.aboutBody')}
        </AppText>
      </View>
      <AppText variant="caption" align="center">
        {t('screens.account2.version', { version: '1.0.0' })}
      </AppText>

      {isAuthed ? (
        confirmLogout ? (
          <View style={styles.confirmRow}>
            <AppText variant="bodySmall" style={{ flex: 1 }}>
              {t('screens.account2.logoutConfirm')}
            </AppText>
            <Pressable
              onPress={() => {
                signOut();
                setConfirmLogout(false);
                router.replace('/home');
              }}
            >
              <AppText variant="label" color={Theme.colors.error}>
                {t('common.logout')}
              </AppText>
            </Pressable>
            <Pressable onPress={() => setConfirmLogout(false)} hitSlop={8}>
              <AppText variant="label" color={Theme.colors.textSecondary}>
                {t('common.cancel')}
              </AppText>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmLogout(true)} style={styles.logoutRow} accessibilityRole="button">
            <LogOut size={16} color={Theme.colors.error} />
            <AppText variant="label" color={Theme.colors.error}>
              {t('common.logout')}
            </AppText>
          </Pressable>
        )
      ) : null}
    </AppScrollScreen>
  );
}

const Stat: React.FC<{ label: string; sub: string }> = ({ label, sub }) => (
  <View style={styles.stat}>
    <AppText variant="h3">{label}</AppText>
    <AppText variant="caption">{sub}</AppText>
  </View>
);

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityBody: { flex: 1 },
  editBlock: { flex: 1 },
  input: {
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 14.5,
    fontWeight: '600',
    color: Theme.colors.text,
    marginTop: 4,
  },
  statsRow: { flexDirection: 'row', gap: Theme.spacing.lg, marginTop: Theme.spacing.md },
  savedRow: { gap: Theme.spacing.md, paddingTop: Theme.spacing.md, paddingRight: Theme.spacing.md },
  savedCard: { width: 132, gap: 2 },
  savedImage: { width: 132, height: 84, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.xs },
  savedFallback: { backgroundColor: Theme.colors.surfaceSecondary },
  stat: { alignItems: 'flex-start' },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    gap: Theme.spacing.md,
  },
  langHeader: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  langRow: { flexDirection: 'row', gap: Theme.spacing.sm },
  langChip: {
    flex: 1,
    height: 42,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  menu: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md, paddingVertical: Theme.spacing.md },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.colors.divider },
  aboutRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.sm },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.primarySoft,
  },
});
