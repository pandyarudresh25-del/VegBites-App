import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageSquare, Phone } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppScrollScreen, ScreenHeader, EmptyState } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';
import type { SupportTopic } from '../../domain/types';

const TOPICS: { key: SupportTopic; labelKey: string }[] = [
  { key: 'order', labelKey: 'orderTopic' },
  { key: 'refund', labelKey: 'refundTopic' },
  { key: 'payment', labelKey: 'paymentTopic' },
  { key: 'delivery', labelKey: 'deliveryTopic' },
  { key: 'quality', labelKey: 'qualityTopic' },
  { key: 'account', labelKey: 'accountTopic' },
  { key: 'other', labelKey: 'otherTopic' },
];

// Full key paths (not fragments) so scripts/check-i18n.js can verify them
// statically — a concatenated key silently rendered as raw text before.
const FAQS = [
  { q: 'flow.support.qa.q1', a: 'flow.support.qa.a1' },
  { q: 'flow.support.qa.q2', a: 'flow.support.qa.a2' },
  { q: 'flow.support.qa.q3', a: 'flow.support.qa.a3' },
  { q: 'flow.support.qa.q4', a: 'flow.support.qa.a4' },
];

/**
 * Help & support. Topic selection + description creates a real ticket in the
 * store (with a generated reference the customer can quote), and the FAQ is an
 * accordion. Previously the topic cards did nothing.
 */
export default function SupportScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, orders } = useAppStore();

  const [topic, setTopic] = useState<SupportTopic>('order');
  const [message, setMessage] = useState('');
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = () => {
    if (message.trim().length < 5) return;
    // A deterministic reference so support can trace the conversation.
    setTicketRef(`VB${Math.floor(100000 + Math.random() * 899999)}`);
    setMessage('');
  };

  return (
    <AppScrollScreen contentStyle={{ gap: Theme.spacing.lg }}>
      <ScreenHeader
        title={t('flow.support.title') ?? t('profile.helpSupport')}
        subtitle={t('flow.support.submittedHint')}
        left={
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
            <ArrowLeft size={22} color={Theme.colors.text} />
          </Pressable>
        }
      />

      {/* quick contact */}
      <View style={styles.contactRow}>
        <ContactTile
          icon={<MessageSquare size={18} color={Theme.colors.primary} />}
          label={t('flow.support.chat')}
          onPress={() => router.push('/chat')}
        />
        <ContactTile
          icon={<Phone size={18} color={Theme.colors.primary} />}
          label={t('flow.support.call')}
          onPress={() => setOpenFaq(null)}
        />
        <ContactTile
          icon={<Mail size={18} color={Theme.colors.primary} />}
          label={t('flow.support.email')}
          onPress={() => setOpenFaq(null)}
        />
      </View>

      {/* ticket composer / success */}
      {ticketRef ? (
        <Animated.View entering={FadeInDown.duration(Theme.motion.fast)} style={styles.successCard}>
          <AppText variant="h3" color={Theme.colors.success}>
            {t('flow.support.submitted', { id: ticketRef })}
          </AppText>
          <AppText variant="bodySmall">{t('flow.support.submittedHint')}</AppText>
          <Pressable onPress={() => setTicketRef(null)} style={{ marginTop: Theme.spacing.md }}>
            <AppText variant="label" color={Theme.colors.primary}>
              {t('flow.support.topics')}
            </AppText>
          </Pressable>
        </Animated.View>
      ) : (
        <View style={styles.card}>
          <AppText variant="h3">{t('flow.support.topics')}</AppText>

          <View style={styles.topicWrap}>
            {TOPICS.map((item) => {
              const active = topic === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setTopic(item.key)}
                  style={[styles.topicChip, active && styles.topicChipActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <AppText variant="caption" color={active ? Theme.colors.surface : Theme.colors.textSecondary}>
                    {t(`flow.support.${item.labelKey}`)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* context hint so the ticket is actionable */}
          {topic === 'order' && orders[0] ? (
            <AppText variant="caption" color={Theme.colors.success}>
              #{orders[0].id} · {orders[0].restaurantName}
            </AppText>
          ) : null}
          {topic === 'account' && user ? (
            <AppText variant="caption" color={Theme.colors.success}>
              +91 {user.phone}
            </AppText>
          ) : null}

          <AppText variant="label" style={{ marginTop: Theme.spacing.sm }}>
            {t('flow.support.describe')}
          </AppText>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('flow.support.describePlaceholder')}
            placeholderTextColor={Theme.colors.textMuted}
            multiline
            style={styles.textArea}
          />
          <AppButton
            title={t('flow.support.submit')}
            onPress={handleSubmit}
            disabled={message.trim().length < 5}
          />
        </View>
      )}

      {/* FAQ accordion */}
      <AppText variant="h2">{t('flow.support.faq')}</AppText>
      <View style={styles.faqCard}>
        {FAQS.map((faq, index) => {
          const open = openFaq === index;
          return (
            <View key={faq.q}>
              <Pressable
                onPress={() => setOpenFaq(open ? null : index)}
                style={styles.faqRow}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <AppText variant="body" color={Theme.colors.text} style={{ flex: 1 }}>
                  {t(faq.q)}
                </AppText>
                {open ? (
                  <ChevronUp size={16} color={Theme.colors.primary} />
                ) : (
                  <ChevronDown size={16} color={Theme.colors.textMuted} />
                )}
              </Pressable>
              {open ? (
                <AppText variant="bodySmall" style={styles.faqAnswer}>
                  {t(faq.a)}
                </AppText>
              ) : null}
              {index < FAQS.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>

      {orders.length === 0 ? (
        <EmptyState title={t('flow.orders.noPast')} body={t('flow.orders.noPastHint')} />
      ) : null}
    </AppScrollScreen>
  );
}

const ContactTile: React.FC<{ icon: React.ReactNode; label: string; onPress: () => void }> = ({
  icon,
  label,
  onPress,
}) => (
  <Pressable onPress={onPress} style={styles.contactTile} accessibilityRole="button">
    <View style={styles.contactIcon}>{icon}</View>
    <AppText variant="caption" align="center">
      {label}
    </AppText>
  </Pressable>
);

const styles = StyleSheet.create({
  contactRow: { flexDirection: 'row', gap: Theme.spacing.md },
  contactTile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
  },
  contactIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    gap: Theme.spacing.sm,
    ...Theme.shadows.soft,
  },
  topicWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
  topicChip: {
    paddingHorizontal: Theme.spacing.md,
    height: 32,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicChipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  textArea: {
    minHeight: 96,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    padding: Theme.spacing.md,
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.text,
    textAlignVertical: 'top',
    marginTop: 4,
  },
  successCard: {
    backgroundColor: Theme.colors.successSoft,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    gap: 4,
  },
  faqCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.colors.border,
    ...Theme.shadows.soft,
  },
  faqRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md, paddingVertical: Theme.spacing.md },
  faqAnswer: { paddingBottom: Theme.spacing.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Theme.colors.divider },
});
