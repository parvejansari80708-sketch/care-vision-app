import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen, Card, MenuRow, Seg, Btn } from '../../components/ui';
import { useLang, type Lang } from '../../i18n';
import { useAuth } from '../../contexts/auth-context';
import { C, SP } from '../../theme';

export default function Profile() {
  const { t, lang, setLang } = useLang();
  const { user, signOut } = useAuth();
  const isGuest = !user || user.isAnonymous;
  const name = isGuest ? t('guest') : user?.email?.split('@')[0] || t('guest');

  const logout = () => {
    Alert.alert(t('logout'), '', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth');
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>
              {isGuest ? t('guest') : user?.email}
            </Text>
          </View>
        </View>

        {isGuest && (
          <Card>
            <Text style={styles.sub}>{t('guestNote')}</Text>
            <View style={{ marginTop: SP.md }}>
              <Btn title={t('signup')} onPress={() => router.replace('/auth')} />
            </View>
          </Card>
        )}

        <Card>
          <Text style={styles.secTitle}>{t('language')}</Text>
          <Seg
            options={[
              { v: 'en', label: 'English' },
              { v: 'hi', label: 'हिंदी' },
              { v: 'ta', label: 'தமிழ்' },
            ]}
            value={lang}
            onChange={(v) => setLang(v as Lang)}
          />
        </Card>

        <Card style={{ paddingVertical: SP.xs }}>
          <MenuRow
            icon="notifications-outline"
            label={t('reminders')}
            onPress={() => router.push('/reminders')}
          />
          <MenuRow
            icon="time-outline"
            label={t('history')}
            onPress={() => router.push('/history')}
          />
          <MenuRow
            icon="bulb-outline"
            label={t('recommend')}
            onPress={() => router.push('/recommend')}
          />
          <View>
            <MenuRow
              icon="log-out-outline"
              label={t('logout')}
              onPress={logout}
              danger
            />
          </View>
        </Card>
        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: SP.lg, gap: SP.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  name: { fontSize: 21, fontWeight: '800', color: C.text },
  email: { fontSize: 14, color: C.muted, marginTop: 2 },
  sub: { fontSize: 14, color: C.muted, lineHeight: 20 },
  secTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: SP.sm },
});
