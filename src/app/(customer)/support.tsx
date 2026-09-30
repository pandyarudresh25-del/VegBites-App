import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, MessageSquare, Phone, Mail, FileText, ChevronRight } from 'lucide-react-native';

const FAQS = [
  { q: 'How do I pause my subscription?', a: 'You can pause your subscription up to 3 times a month from the My Subscription page.' },
  { q: 'Where is my order?', a: 'You can track your active orders from the Live Tracking screen available in the Orders tab.' },
  { q: 'How do I get a refund?', a: 'Refunds are automatically credited to your Wallet within 24 hours of cancellation.' }
];

export default function SupportScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Help & Support</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.contactSection}>
           <AppText variant="h3" style={{marginBottom: Theme.spacing.md}}>Contact Us</AppText>
           <View style={styles.contactGrid}>
             <TouchableOpacity style={styles.contactCard} activeOpacity={0.7} onPress={() => router.push('/(customer)/chat')}>
                <View style={[styles.iconBg, {backgroundColor: '#E0F2FE'}]}>
                  <MessageSquare size={24} color="#0284C7" />
                </View>
                <AppText variant="h3">Chat AI</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>Reply instantly</AppText>
             </TouchableOpacity>

             <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
                <View style={[styles.iconBg, {backgroundColor: Theme.colors.success + '20'}]}>
                  <Phone size={24} color={Theme.colors.success} />
                </View>
                <AppText variant="h3">Call</AppText>
                <AppText variant="caption" color={Theme.colors.textMuted}>24/7 Support</AppText>
             </TouchableOpacity>
           </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.faqSection}>
          <AppText variant="h3" style={{marginBottom: Theme.spacing.md}}>Frequently Asked Questions</AppText>
          <View style={styles.faqList}>
             {FAQS.map((faq, index) => (
               <View key={index} style={styles.faqItem}>
                 <TouchableOpacity style={styles.faqHeader} activeOpacity={0.7}>
                   <AppText variant="body" style={{fontWeight: 'bold', flex: 1}}>{faq.q}</AppText>
                   <ChevronRight size={20} color={Theme.colors.textMuted} />
                 </TouchableOpacity>
                 <AppText variant="bodySmall" color={Theme.colors.textSecondary} style={{marginTop: 8, lineHeight: 20}}>
                   {faq.a}
                 </AppText>
               </View>
             ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
           <TouchableOpacity style={styles.policyRow} activeOpacity={0.7}>
              <FileText size={20} color={Theme.colors.textMuted} style={{marginRight: 12}} />
              <AppText variant="body" style={{flex: 1}}>Terms & Conditions</AppText>
              <ChevronRight size={20} color={Theme.colors.textMuted} />
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.policyRow} activeOpacity={0.7}>
              <FileText size={20} color={Theme.colors.textMuted} style={{marginRight: 12}} />
              <AppText variant="body" style={{flex: 1}}>Privacy Policy</AppText>
              <ChevronRight size={20} color={Theme.colors.textMuted} />
           </TouchableOpacity>
        </Animated.View>

      </ScrollView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  contactSection: {
    marginBottom: Theme.spacing.xl,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  contactCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  faqSection: {
    marginBottom: Theme.spacing.xl,
  },
  faqList: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  faqItem: {
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  }
});
