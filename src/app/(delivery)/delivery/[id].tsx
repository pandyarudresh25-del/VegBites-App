import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../components/AppText';
import { Theme } from '../../../theme';
import { ArrowLeft, MapPin, Check } from 'lucide-react-native';

const STATUSES = [
  { id: '1', label: 'Picked Up', completed: true },
  { id: '2', label: 'On the Way', completed: true },
  { id: '3', label: 'Reached Customer', completed: false },
  { id: '4', label: 'Delivered', completed: false },
];

export default function DeliveryTrackingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Delivery Tracking</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.mapContainer}>
           <View style={styles.mapPlaceholder}>
             {/* Simple Map graphic simulation */}
             <View style={styles.mapRoute}>
               <View style={styles.mapDotA}>
                 <MapPin size={16} color="#fff" />
               </View>
               <View style={styles.mapLine} />
               <View style={styles.mapDotB}>
                 <AppText variant="caption" color="#fff" style={{fontWeight: 'bold'}}>B</AppText>
               </View>
             </View>
           </View>
        </Animated.View>

        <View style={styles.timeline}>
          {STATUSES.map((status, index) => (
            <Animated.View key={status.id} entering={FadeInDown.delay(200 + index * 100).springify()}>
              <View style={styles.statusRow}>
                
                <View style={styles.timelineIndicator}>
                  <View style={[styles.dot, status.completed && styles.dotCompleted]}>
                    {status.completed && <Check size={12} color="#fff" strokeWidth={3} />}
                  </View>
                  {index < STATUSES.length - 1 && (
                    <View style={styles.line} />
                  )}
                </View>

                <AppText 
                  variant="h3" 
                  style={[styles.statusText, !status.completed && { color: Theme.colors.textMuted }]}
                >
                  {status.label}
                </AppText>
                
              </View>
            </Animated.View>
          ))}
        </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xxl,
  },
  mapContainer: {
    height: 250,
    width: '100%',
    backgroundColor: Theme.colors.surfaceSecondary,
    marginBottom: Theme.spacing.xxl,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E4D9', // Map background tint
  },
  mapRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ rotate: '-15deg' }],
  },
  mapDotA: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  mapDotB: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  mapLine: {
    width: 100,
    height: 3,
    backgroundColor: Theme.colors.primary,
    marginHorizontal: -4,
  },
  timeline: {
    paddingLeft: Theme.spacing.xl,
    paddingRight: Theme.spacing.xl,
  },
  statusRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: Theme.spacing.lg,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dotCompleted: {
    backgroundColor: '#3B82F6', // Blue for delivery tracking as per design logic usually
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Theme.colors.border,
    marginTop: -2,
    marginBottom: -2,
    zIndex: 1,
  },
  statusText: {
    marginTop: -2,
  },
});
