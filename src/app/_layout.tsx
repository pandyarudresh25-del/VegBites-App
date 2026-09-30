import { Stack } from 'expo-router';
import { Theme } from '../theme';
import { Platform, View } from 'react-native';
import { LanguageProvider } from '../context/LanguageContext';

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

export default function RootLayout() {
  return (
    <LanguageProvider>
      <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
        <GlobalWebStyles />
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.background, flex: 1 }
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(vendor)" />
          <Stack.Screen name="(delivery)" />
        </Stack>
      </View>
    </LanguageProvider>
  );
}
