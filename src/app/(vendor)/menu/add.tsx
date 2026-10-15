import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { Theme } from '../../../theme';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react-native';

export default function AddMenuItemScreen() {
  const router = useRouter();
  const [available, setAvailable] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="h2">Add Item</AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.springify()} style={styles.formGroup}>
          <TouchableOpacity style={styles.imageUpload}>
            <ImageIcon size={32} color={Theme.colors.textMuted} />
            <AppText variant="button" color={Theme.colors.primary} style={{ marginTop: 8 }}>
              Upload Image
            </AppText>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formGroup}>
          <AppText variant="bodySmall">Item Name</AppText>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Gujarati Thali"
            placeholderTextColor={Theme.colors.textMuted}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.formGroup}>
          <AppText variant="bodySmall">Category</AppText>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Thali"
            placeholderTextColor={Theme.colors.textMuted}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formGroup}>
          <AppText variant="bodySmall">Description</AppText>
          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Enter ingredients or details..."
            placeholderTextColor={Theme.colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.formGroup}>
          <AppText variant="bodySmall">Price (₹)</AppText>
          <TextInput 
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Theme.colors.textMuted}
            keyboardType="numeric"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.switchGroup}>
          <View>
            <AppText variant="body">Available</AppText>
            <AppText variant="caption" color={Theme.colors.textMuted}>Customers can order this</AppText>
          </View>
          <Switch 
            value={available}
            onValueChange={setAvailable}
            trackColor={{ false: Theme.colors.border, true: Theme.colors.success }}
            thumbColor={Theme.colors.surface}
          />
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton 
          title="Save Item"
          onPress={() => router.back()}
          style={styles.actionButton}
        />
      </View>
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
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backBtn: {
    padding: Theme.spacing.xs,
  },
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  formGroup: {
    gap: Theme.spacing.xs,
  },
  imageUpload: {
    height: 160,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 14,
    fontFamily: 'System',
    fontSize: 16,
    color: Theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  footer: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  actionButton: {
    width: '100%',
  },
});
