import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, TopBar, StepLine, H2, Sub } from '../components/ui';
import { useLang } from '../i18n';
import { MODS, RECO } from '../data/health';
import { C, SP } from '../theme';

const PLAN = [
  ['Morning', 'Warm water + 15 min walk + veg breakfast'],
  ['Afternoon', 'Balanced lunch + 5-min stretch + water'],
  ['Evening', '30 min activity + light dinner'],
  ['Night', 'Screens off 1 hr before bed + 7–8 hr sleep'],
];

export default function Recommend() {
  const { t, lang } = useLang();

  return (
    <Screen>
      <TopBar title={t('recommend')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {MODS.map((m) => (
          <Card key={m.id}>
            <View style={styles.hrow}>
              <Ionicons name="bulb-outline" size={20} color={C.primaryDeep} />
              <H2>{(m as any)[lang] || m.en}</H2>
            </View>
            {(((RECO[m.id] as any)?.[lang] || (RECO[m.id] as any)?.en) || []).map(
              (r: string, i: number) => (
                <StepLine key={i} ok>
                  {r}
                </StepLine>
              )
            )}
          </Card>
        ))}
        <Card>
          <H2>{t('dailyPlanFull') || t('dailyPlan') || 'Daily plan'}</H2>
          {PLAN.map(([a, b], i) => (
            <View key={i} style={styles.kv}>
              <Sub style={{ fontWeight: '700' }}>{a}</Sub>
              <Sub>{b}</Sub>
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg, paddingTop: SP.sm, paddingBottom: 40 },
  hrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SP.sm },
  kv: { marginBottom: SP.sm },
});
