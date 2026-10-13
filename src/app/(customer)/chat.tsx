import React, { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, Send } from 'lucide-react-native';
import { puter } from '@heyputer/puter.js';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi! I am the VegBites AI Assistant. How can I help you with your homemade food delivery today?', isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now().toString(), text: inputText.trim(), isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Build conversation context
      const prompt = `You are the VegBites AI Support Assistant. VegBites is a premium Gujarati/Indian food delivery app focusing on fresh, healthy, homemade meals and tiffin subscriptions. Be polite, warm, and helpful. Keep responses concise.\n\nUser: ${userMessage.text}\nAssistant:`;
      
      const response = await puter.ai.chat(prompt, { model: 'openai/gpt-5.3-codex' });
      
      let aiText = 'Sorry, I could not process that.';
      if (typeof response === 'string') {
        aiText = response;
      } else if (response && typeof response === 'object') {
        // @ts-ignore - Handle Puter object responses safely
        aiText = String(response.message?.content || response.text || response.toString());
      }

      const aiMessage = { 
        id: (Date.now() + 1).toString(), 
        text: aiText, 
        isUser: false 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { id: (Date.now() + 1).toString(), text: 'Sorry, I am having trouble connecting right now. Please try again later.', isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <AppText variant="h2" style={styles.headerTitle}>VegBites Support</AppText>
          <AppText variant="caption" color={Theme.colors.success}>AI Agent Online</AppText>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            <Animated.View 
              key={msg.id} 
              entering={FadeInDown.duration(400).delay(index * 50)}
              style={[
                styles.messageBubble,
                msg.isUser ? styles.userBubble : styles.aiBubble
              ]}
            >
              <AppText 
                variant="body" 
                color={msg.isUser ? Theme.colors.surface : Theme.colors.text}
              >
                {msg.text}
              </AppText>
            </Animated.View>
          ))}
          
          {isTyping && (
            <Animated.View entering={FadeIn} style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={Theme.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={200}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
  },
  keyboardView: {
    flex: 1,
  },
  chatContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
  },
  userBubble: {
    backgroundColor: Theme.colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Theme.colors.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    width: 60,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Theme.spacing.xl : Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: Theme.spacing.sm,
    fontSize: 15,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Theme.colors.border,
  },
});
