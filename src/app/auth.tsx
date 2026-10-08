import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Screen, Btn, Field, Seg, Card } from '../components/ui';
import { useLang } from '../i18n';
import { useAuth } from '../contexts/auth-context';
import { C, SP } from '../theme';

export default function Auth() {
  const { t, lang, setLang } = useLang();
  const { signIn, signUp, signInGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const go = () => router.replace('/(tabs)');

  const submit = async () => {
    if (!email.includes('@')) return Alert.alert(t('error'), t('email'));
    if (password.length < 6)
      return Alert.alert(t('error'), t('password'));
    setBusy(true);
    try {
      if (mode === 'login') await signIn(email, password);
      else await signUp(email, password);
      go();
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setBusy(false);
    }
  };

  const guest = async () => {
    setBusy(true);
    try {
      await signInGuest();
      go();
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.wrap}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.logo}>CARE-VISION AI</Text>
          <Text style={styles.sub}>
            {mode === 'login' ? t('welcomeBack') : t('createAccount')}
          </Text>

          <Seg
            options={[
              { v: 'login', label: t('login') },
              { v: 'signup', label: t('signup') },
            ]}
            value={mode}
            onChange={setMode}
          />
          <View style={{ height: SP.lg }} />

          {mode === 'signup' && (
            <Field
              label={t('name')}
              value={name}
              onChangeText={setName}
              placeholder={t('name')}
            />
          )}
          <Field
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboard="email-address"
          />
          <Field
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secure
          />

          <Btn
            title={busy ? '…' : mode === 'login' ? t('login') : t('signup')}
            onPress={submit}
          />

          <TouchableOpacity onPress={guest} style={styles.guestBtn}>
            <Text style={styles.guestText}>
              {t('guest')} → {t('guestNote')}
            </Text>
          </TouchableOpacity>

          <Card style={{ marginTop: SP.xl }}>
            <Text style={styles.langLabel}>{t('language')}</Text>
            <Seg
              options={[
                { v: 'en', label: 'English' },
                { v: 'hi', label: 'हिंदी' },
                { v: 'ta', label: 'தமிழ்' },
              ]}
              value={lang}
              onChange={setLang}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: SP.xl, paddingTop: 48 },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  sub: {
    fontSize: 16,
    color: C.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: SP.xl,
  },
  guestBtn: { marginTop: SP.lg, alignItems: 'center' },
  guestText: { color: C.primaryDeep, fontSize: 14, fontWeight: '600' },
  langLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: SP.sm,
  },
});
