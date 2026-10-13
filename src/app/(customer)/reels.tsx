import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '../../components/AppText';
import { Theme } from '../../theme';
import { ArrowLeft, Heart, MessageCircle, Share2, Plus } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// A placeholder reel to simulate full screen vertical feed
export default function ReelsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {/* Background Image simulating video */}
      <Animated.Image 
        entering={FadeIn.duration(800)}
        source={require('../../../assets/images/gujarati_thali.jpg')} 
        style={styles.videoBackground} 
      />
      <View style={styles.overlay} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <AppText variant="h2" color="#fff">{t('reels.title')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      {/* Right Side Actions */}
      <Animated.View entering={SlideInUp.duration(600).delay(200)} style={styles.actionColumn}>
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={32} color="#fff" />
          <AppText variant="caption" color="#fff" style={styles.actionText}>12.4k</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={32} color="#fff" />
          <AppText variant="caption" color="#fff" style={styles.actionText}>428</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={32} color="#fff" />
          <AppText variant="caption" color="#fff" style={styles.actionText}>{t('reels.share')}</AppText>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Info */}
      <Animated.View entering={SlideInUp.duration(600).delay(300)} style={styles.bottomInfo}>
        <View style={styles.vendorRow}>
           <Image source={require('../../../assets/images/gujarati_thali.jpg')} style={styles.vendorAvatar} />
           <AppText variant="h3" color="#fff" style={{marginRight: 8}}>Shree Krishna Tiffin</AppText>
           <TouchableOpacity style={styles.followButton}>
              <Plus size={14} color="#fff" style={{marginRight: 2}} />
              <AppText variant="caption" color="#fff" style={{fontWeight: 'bold'}}>{t('reels.follow')}</AppText>
           </TouchableOpacity>
        </View>
        <AppText variant="bodySmall" color="#rgba(255,255,255,0.8)" style={styles.description}>
          Fresh, hot, and delicious Gujarati Thali being prepared for today&apos;s lunch! 🔥🥘 #GujaratiFood #Tiffin
        </AppText>
        
        <TouchableOpacity style={styles.orderCta}>
          <AppText variant="h3" color={Theme.colors.primary}>{t('reels.orderNow')} - ₹120</AppText>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.text,
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dark gradient overlay for text readability
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60, // Safe area top
    paddingBottom: Theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  actionColumn: {
    position: 'absolute',
    right: Theme.spacing.md,
    bottom: 160,
    alignItems: 'center',
    gap: Theme.spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomInfo: {
    position: 'absolute',
    left: Theme.spacing.lg,
    right: Theme.spacing.xxl * 2, // Space for right actions
    bottom: 40, // Safe area bottom
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  vendorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.surface,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  description: {
    lineHeight: 20,
    marginBottom: Theme.spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  orderCta: {
    backgroundColor: Theme.colors.surface,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.pill,
    alignSelf: 'flex-start',
  }
});
