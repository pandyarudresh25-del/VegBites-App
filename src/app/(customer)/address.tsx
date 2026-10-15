import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Briefcase, Check, Home as HomeIcon, MapPin, Plus, X } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import type { AddressLabel } from '../../domain/types';

type FormState = {
  label: AddressLabel;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
};

const EMPTY_FORM: FormState = {
  label: 'home',
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: 'Rajkot',
  pincode: '',
};

const LABEL_ICON: Record<AddressLabel, typeof HomeIcon> = {
  home: HomeIcon,
  work: Briefcase,
  other: MapPin,
};

/**
 * Saved addresses. Selecting one sets it as default, which is what checkout
 * reads. The add form validates each field and writes to the store.
 */
export default function AddressScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addresses, selectedAddress, addAddress, selectAddress } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [toast, setToast] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, boolean>> = {};
    if (!form.name.trim()) next.name = true;
    if (form.phone.replace(/\D/g, '').length !== 10) next.phone = true;
    if (!form.line1.trim()) next.line1 = true;
    if (!form.line2.trim()) next.line2 = true;
    if (!form.city.trim()) next.city = true;
    if (form.pincode.replace(/\D/g, '').length !== 6) next.pincode = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addAddress({
      label: form.label,
      name: form.name.trim(),
      phone: form.phone.replace(/\D/g, ''),
      line1: form.line1.trim(),
      line2: form.line2.trim(),
      city: form.city.trim(),
      pincode: form.pincode.replace(/\D/g, ''),
      isDefault: true,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setToast(t('screens.address.saved'));
    setTimeout(() => setToast(null), 2000);
  };

  const labelText = (key: AddressLabel) =>
    t(key === 'work' ? 'address.office' : key === 'home' ? 'address.home' : 'address.default');

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {toast ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.toast}>
          <AppText variant="bodySmall" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}

      <AppScrollScreen contentStyle={{ gap: Theme.spacing.md }}>
        <ScreenHeader
          title={t('profile.savedAddresses')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
          right={
            <Pressable
              onPress={() => setShowForm((s) => !s)}
              hitSlop={10}
              accessibilityLabel={t('screens.address.addNew')}
            >
              {showForm ? <X size={20} color={Theme.colors.textSecondary} /> : <Plus size={20} color={Theme.colors.primary} />}
            </Pressable>
          }
        />

        {/* ---- add form ---- */}
        {showForm ? (
          <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.card}>
            <AppText variant="h3">{t('screens.address.addNew')}</AppText>

            {/* label chooser */}
            <View style={styles.labelRow}>
              {(['home', 'work', 'other'] as AddressLabel[]).map((key) => {
                const Icon = LABEL_ICON[key];
                const active = form.label === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => set('label', key)}
                    style={[styles.labelChip, active && styles.labelChipActive]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Icon size={14} color={active ? Theme.colors.surface : Theme.colors.textSecondary} />
                    <AppText variant="caption" color={active ? Theme.colors.surface : Theme.colors.textSecondary}>
                      {labelText(key)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <Field
              label={t('screens.address.fullName')}
              value={form.name}
              onChangeText={(v) => set('name', v)}
              invalid={errors.name}
            />
            <Field
              label={t('screens.address.phone')}
              value={form.phone}
              onChangeText={(v) => set('phone', v.replace(/\D/g, '').slice(0, 10))}
              invalid={errors.phone}
              keyboardType="number-pad"
            />
            <Field
              label={t('screens.address.line1')}
              value={form.line1}
              onChangeText={(v) => set('line1', v)}
              invalid={errors.line1}
            />
            <Field
              label={t('screens.address.line2')}
              value={form.line2}
              onChangeText={(v) => set('line2', v)}
              invalid={errors.line2}
            />
            <View style={styles.twoUp}>
              <View style={{ flex: 1 }}>
                <Field
                  label={t('screens.address.city')}
                  value={form.city}
                  onChangeText={(v) => set('city', v)}
                  invalid={errors.city}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label={t('screens.address.pincode')}
                  value={form.pincode}
                  onChangeText={(v) => set('pincode', v.replace(/\D/g, '').slice(0, 6))}
                  invalid={errors.pincode}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <AppButton title={t('screens.address.saveAddress')} onPress={handleSave} />
          </Animated.View>
        ) : null}

        {/* ---- saved list ---- */}
        {addresses.length === 0 ? (
          <EmptyState
            icon={<MapPin size={28} color={Theme.colors.primary} />}
            title={t('screens.address.noSaved')}
            body={t('screens.address.noSavedHint')}
            action={<AppButton title={t('screens.address.addNew')} onPress={() => setShowForm(true)} />}
          />
        ) : (
          addresses.map((address, index) => {
            const Icon = LABEL_ICON[address.label];
            const active = selectedAddress?.id === address.id;
            return (
              <Animated.View key={address.id} entering={FadeInDown.delay(index * 50).duration(Theme.motion.base)}>
                <Pressable
                  onPress={() => selectAddress(address.id)}
                  style={[styles.addressCard, active && styles.addressCardActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <View style={[styles.iconBubble, active && styles.iconBubbleActive]}>
                    <Icon size={16} color={active ? Theme.colors.surface : Theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <AppText variant="h3">{labelText(address.label)}</AppText>
                      {active ? (
                        <View style={styles.defaultTag}>
                          <AppText variant="caption" color={Theme.colors.success}>
                            {t('address.default')}
                          </AppText>
                        </View>
                      ) : null}
                    </View>
                    <AppText variant="bodySmall" style={{ marginTop: 2 }}>
                      {address.line1}, {address.line2}
                    </AppText>
                    <AppText variant="bodySmall">
                      {address.city} – {address.pincode}
                    </AppText>
                    <AppText variant="caption" style={{ marginTop: 2 }}>
                      {address.name} · +91 {address.phone}
                    </AppText>
                  </View>
                  {active ? <Check size={16} color={Theme.colors.success} strokeWidth={3} /> : null}
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </AppScrollScreen>
    </View>
  );
}

const Field: React.FC<{
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  invalid?: boolean;
  keyboardType?: 'default' | 'number-pad';
}> = ({ label, value, onChangeText, invalid, keyboardType = 'default' }) => (
  <View style={{ gap: 4 }}>
    <AppText variant="caption">{label}</AppText>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      inputMode={keyboardType === 'number-pad' ? 'numeric' : 'text'}
      placeholderTextColor={Theme.colors.textMuted}
      placeholder={label}
      style={[styles.input, invalid && styles.inputInvalid]}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    gap: Theme.spacing.md,
    ...Theme.shadows.soft,
  },
  labelRow: { flexDirection: 'row', gap: Theme.spacing.sm },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Theme.spacing.md,
    height: 34,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  labelChipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  input: {
    height: 46,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  inputInvalid: { borderWidth: 1.5, borderColor: Theme.colors.error },
  twoUp: { flexDirection: 'row', gap: Theme.spacing.md },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  addressCardActive: { borderColor: Theme.colors.success },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleActive: { backgroundColor: Theme.colors.success },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  defaultTag: {
    backgroundColor: Theme.colors.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Theme.borderRadius.sm,
  },
  toast: {
    position: 'absolute',
    top: Theme.spacing.huge,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
  },
});
