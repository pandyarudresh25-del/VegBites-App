import { Stack } from 'expo-router';
import { Theme } from '../theme';
import { Platform, View } from 'react-native';
import { LanguageProvider } from '../context/LanguageContext';
import { AppStoreProvider } from '../store/AppStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const GlobalWebStyles = () => {
  if (Platform.OS !== 'web') return null;
  return (
    <style>
      {`
        html, body, #root {
          height: 100%;
          width: 100%;
          background-color: ${Theme.colors.background};
          overscroll-behavior-y: none;
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        input, textarea {
          outline: none !important;
        }
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}
    </style>
  );
};

/**
 * Provider order matters: language first (the store's copy can be localized),
 * then the app store, both above the navigator so state survives navigation
 * between every route group.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AppStoreProvider>
            <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
              <GlobalWebStyles />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Theme.colors.background, flex: 1 },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" options={{ animation: 'fade' }} />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(customer)" />
                <Stack.Screen name="(vendor)" />
                <Stack.Screen name="(delivery)" />
              </Stack>
            </View>
          </AppStoreProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
