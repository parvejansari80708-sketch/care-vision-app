import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/auth-context';
import { useLang } from '../i18n';
import { C } from '../theme';

export default function Splash() {
  const { user, loading } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    if (loading) return;
    const go = async () => {
      await new Promise((r) => setTimeout(r, 1400));
      const done = await AsyncStorage.getItem('cv_onboard');
      if (!done) router.replace('/onboarding');
      else if (!user) router.replace('/auth');
      else router.replace('/(tabs)');
    };
    go();
  }, [loading, user]);

  return (
    <View style={styles.wrap}>
      <View style={styles.logoBox}>
        <Text style={styles.logoPlus}>+</Text>
      </View>
      <Text style={styles.logo}>CARE-VISION AI</Text>
      <Text style={styles.tag}>{t('tagline')}</Text>
      <ActivityIndicator color={C.primary} style={{ marginTop: 28 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBox: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoPlus: { color: '#fff', fontSize: 44, fontWeight: '300', marginTop: -4 },
  logo: { fontSize: 24, fontWeight: '800', color: C.text, letterSpacing: 1 },
  tag: { fontSize: 15, color: C.muted, marginTop: 8, textAlign: 'center' },
});
