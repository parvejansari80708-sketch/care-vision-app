import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../i18n';
import { AuthProvider } from '../contexts/auth-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="module/[id]" />
            <Stack.Screen name="skin" />
            <Stack.Screen name="report" />
            <Stack.Screen name="xray" />
            <Stack.Screen name="reminders" />
            <Stack.Screen name="history" />
            <Stack.Screen name="recommend" />
          </Stack>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
