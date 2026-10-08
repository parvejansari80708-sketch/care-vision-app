import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, H2, Sub, TopBar } from '../../components/ui';
import { FadeIn } from '../../components/anim';
import { useLang } from '../../i18n';
import { C, SP, R } from '../../theme';

const OPTIONS = [
  { route: '/skin', icon: 'scan-outline', tk: 'faceSkin', dk: 'ob2d' },
  { route: '/report', icon: 'document-text-outline', tk: 'reportScan', dk: 'reportExpl' },
  { route: '/xray', icon: 'medkit-outline', tk: 'xrayTitle', dk: 'demoNote' },
] as const;

export default function Scan() {
  const { t } = useLang();

  return (
    <Screen>
      <TopBar title={t('scan')} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Sub style={{ marginBottom: SP.lg }}>{t('ob2d')}</Sub>
        {OPTIONS.map((o, i) => (
          <FadeIn key={o.route} delay={i * 70}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(o.route as any)}
            >
              <Card style={styles.card}>
                <View style={styles.iconBox}>
                  <Ionicons name={o.icon as any} size={34} color={C.primaryDeep} />
                </View>
                <H2>{t(o.tk)}</H2>
                <Sub>{t(o.dk)}</Sub>
                <View style={styles.cta}>
                  <Text style={styles.ctaText}>{t('takePhoto')} →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          </FadeIn>
        ))}
        <View style={{ height: 90 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg, paddingTop: SP.sm },
  card: { alignItems: 'center', paddingVertical: SP.xl },
  iconBox: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SP.md,
  },
  cta: {
    marginTop: SP.md,
    backgroundColor: C.tint,
    borderRadius: R.md,
    paddingHorizontal: SP.lg,
    paddingVertical: SP.sm,
  },
  ctaText: { color: C.primaryDeep, fontWeight: '700', fontSize: 14 },
});
