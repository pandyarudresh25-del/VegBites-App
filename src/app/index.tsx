import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, ZoomIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AppText } from '../components/AppText';
import { Theme } from '../theme';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const logoScale = useSharedValue(0.5);

  useEffect(() => {
    // Initial bounce animation for logo
    logoScale.value = withSpring(1, { damping: 12 });
    
    // Auto navigate to welcome after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/(auth)/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }]
    };
  });

  return (
    <View style={styles.container}>
      {/* Decorative background food elements (blurred/faded) */}
      <Animated.Image 
        entering={FadeIn.duration(1000)}
        source={require('../../assets/images/gujarati_thali.jpg')} 
        style={styles.bgImage1} 
      />
      <Animated.Image 
        entering={FadeIn.duration(1000).delay(200)}
        source={require('../../assets/images/punjabi_thali.jpg')} 
        style={styles.bgImage2} 
      />

      <Animated.View 
        entering={ZoomIn.duration(800)} 
        exiting={FadeOut}
        style={[styles.content, animatedLogoStyle]}
      >
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <AppText variant="h1" style={styles.logoText}>VegBites</AppText>
        <AppText variant="caption" style={styles.logoSubText}>{t('splash.subtitle')}</AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.1,
  },
  bgImage2: {
    position: 'absolute',
    bottom: -80,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: Theme.spacing.sm,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  logoSubText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },
});
