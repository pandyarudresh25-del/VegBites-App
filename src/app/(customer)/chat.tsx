import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Info, Send, Ticket } from 'lucide-react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/AppScreen';
import { Theme } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useAppStore } from '../../store/AppStore';

/**
 * Support chat.
 *
 * Previously this screen called a third-party hosted AI model
 * (`@heyputer/puter.js`, hardcoded to `openai/gpt-5.3-codex`) directly from a
 * customer screen. That dependency is gone: the conversation is stored locally and
 * replies are scripted from the customer's real order/subscription state, so the
 * screen never implies a human agent answered.
 */
export default function ChatScreen() {
  const router = useRouter();
  const { t, time } = useLanguage();
  const { chat, sendChatMessage, submitTicket, tickets } = useAppStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scroller = useRef<ScrollView>(null);

  const quickReplies = useMemo(
    () => [t('screens.chat.quickOrder'), t('screens.chat.quickRefund'), t('screens.chat.quickAddress')],
    [t],
  );

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || isTyping) return;
    setInput('');
    setIsTyping(true);
    // Brief delay so the reply does not appear before the customer's own bubble.
    setTimeout(() => {
      sendChatMessage(text);
      setIsTyping(false);
      scroller.current?.scrollToEnd({ animated: true });
    }, 550);
  };

  const openTicket = () => {
    const ticket = submitTicket({
      topic: 'other',
      message: chat.filter((m) => m.from === 'me').map((m) => m.text).join(' | ') || t('screens.chat.greeting'),
    });
    setToast(t('screens.chat.ticketCreated', { id: ticket.id }));
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          title={t('screens.chat.title')}
          subtitle={t('screens.chat.subtitle')}
          left={
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
              <ArrowLeft size={22} color={Theme.colors.text} />
            </Pressable>
          }
          right={<Ticket size={18} color={Theme.colors.textMuted} />}
        />
      </View>

      <View style={styles.notice}>
        <Info size={14} color={Theme.colors.textMuted} />
        <AppText variant="caption" color={Theme.colors.textMuted} style={{ flex: 1 }}>
          {t('screens.chat.scripted')}
        </AppText>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scroller}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chat}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
        >
          <View style={[styles.bubble, styles.agentBubble]}>
            <AppText variant="bodySmall" color={Theme.colors.textSecondary}>
              {t('screens.chat.agentLabel')}
            </AppText>
            <AppText variant="body">{t('screens.chat.greeting')}</AppText>
          </View>

          {chat.map((message) => (
            <Animated.View
              key={message.id}
              entering={FadeInDown.duration(Theme.motion.fast)}
              style={[styles.bubble, message.from === 'me' ? styles.myBubble : styles.agentBubble]}
            >
              <AppText variant="body" color={message.from === 'me' ? Theme.colors.surface : Theme.colors.text}>
                {message.text}
              </AppText>
              <AppText
                variant="caption"
                color={message.from === 'me' ? Theme.colors.surface : Theme.colors.textMuted}
                style={styles.stamp}
              >
                {time(message.at)}
              </AppText>
            </Animated.View>
          ))}

          {isTyping ? (
            <View style={[styles.bubble, styles.agentBubble, styles.typing]}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.quickRow}>
          {quickReplies.map((reply) => (
            <Pressable
              key={reply}
              onPress={() => send(reply)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
            >
              <AppText variant="caption" color={Theme.colors.primary}>
                {reply}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder={t('screens.chat.placeholder')}
            placeholderTextColor={Theme.colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={280}
            onSubmitEditing={() => send()}
            accessibilityLabel={t('screens.chat.placeholder')}
          />
          <Pressable
            style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || isTyping}
            accessibilityRole="button"
            accessibilityLabel={t('screens.chat.send')}
            hitSlop={6}
          >
            <Send size={19} color={Theme.colors.surface} />
          </Pressable>
        </View>

        <View style={styles.ticketRow}>
          <AppButton
            variant="outline"
            title={
              tickets.length > 0
                ? t('screens.chat.ticketsOpen', { count: tickets.length })
                : t('screens.chat.openTicket')
            }
            onPress={openTicket}
          />
        </View>
      </KeyboardAvoidingView>

      {toast ? (
        <View style={styles.toast}>
          <AppText variant="caption" color={Theme.colors.surface}>
            {toast}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Theme.colors.background },
  headerWrap: { paddingHorizontal: Theme.layout.screenPaddingX },
  flex: { flex: 1 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginHorizontal: Theme.layout.screenPaddingX,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  chat: { padding: Theme.layout.screenPaddingX, gap: Theme.spacing.sm, paddingBottom: Theme.spacing.xl },
  bubble: { maxWidth: '84%', padding: Theme.spacing.md, borderRadius: Theme.borderRadius.lg, gap: 2 },
  myBubble: { backgroundColor: Theme.colors.primary, alignSelf: 'flex-end' },
  agentBubble: {
    backgroundColor: Theme.colors.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  typing: { width: 56, alignItems: 'center', justifyContent: 'center' },
  stamp: { alignSelf: 'flex-end' },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.layout.screenPaddingX,
    paddingBottom: Theme.spacing.sm,
  },
  quickChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primarySoft,
  },
  quickChipPressed: { opacity: 0.7 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.layout.screenPaddingX,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: 15,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
  },
  sendDisabled: { backgroundColor: Theme.colors.border },
  ticketRow: {
    paddingHorizontal: Theme.layout.screenPaddingX,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
  },
  toast: {
    position: 'absolute',
    top: Theme.spacing.huge,
    alignSelf: 'center',
    backgroundColor: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
  },
});
