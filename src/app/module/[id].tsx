import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Btn, TopBar, PBar, RiskChip, StepLine, H2, Sub } from '../../components/ui';
import { FadeIn } from '../../components/anim';
import { useLang } from '../../i18n';
import { MODS, ASSESS_Q, RECO } from '../../data/health';
import { saveAssessment } from '../../lib/db';
import { C, SP, R } from '../../theme';

export default function ModuleFlow() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useLang();
  const mod = MODS.find((m) => m.id === id);
  const qs: [string, string[]][] = (ASSESS_Q[id || ''] || []) as any;

  const [step, setStep] = useState(-1);
  const [ans, setAns] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  if (!mod || !qs.length) {
    return (
      <Screen>
        <TopBar title="" onBack={() => router.back()} />
        <Sub style={{ padding: SP.lg }}>{t('error')}</Sub>
      </Screen>
    );
  }

  const done = step >= qs.length;
  const score = ans.reduce((a, b) => a + b, 0);
  const max = qs.length * 2;
  const level: 'low' | 'moderate' | 'high' =
    score <= max * 0.3 ? 'low' : score <= max * 0.6 ? 'moderate' : 'high';

  const choose = (optIdx: number) => {
    setAns((a) => [...a, optIdx]);
    setStep((s) => s + 1);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveAssessment({ module: id, answers: ans, risk: level, lang });
      Alert.alert(t('savedOk'));
      router.back();
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setSaving(false);
    }
  };

  const title = (mod as any)[lang] || mod.en;

  return (
    <Screen>
      <TopBar title={title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {step === -1 && (
          <View>
            <Card style={{ alignItems: 'center', paddingVertical: SP.xl }}>
              <Ionicons name="clipboard-outline" size={56} color={C.primaryDeep} />
              <H2>{title}</H2>
              <Sub style={{ textAlign: 'center' }}>
                {qs.length} {t('startAssess')}
              </Sub>
            </Card>
            <Btn title={t('startAssess')} onPress={() => setStep(0)} />
          </View>
        )}

        {step >= 0 && !done && (
          <FadeIn key={step} delay={0} y={10}>
            <View>
              <PBar progress={step / qs.length} />
              <Text style={styles.count}>
                {step + 1} / {qs.length}
              </Text>
              <Card style={{ marginTop: SP.md }}>
                <H2>{qs[step][0]}</H2>
                {qs[step][1].map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.opt}
                    onPress={() => choose(i)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          </FadeIn>
        )}

        {done && (
          <View>
            <Card style={{ alignItems: 'center', paddingVertical: SP.xl }}>
              <Text style={styles.resultLabel}>{t('yourRisk')}</Text>
              <View style={{ marginVertical: SP.md }}>
                <RiskChip level={level} />
              </View>
              <Sub style={{ textAlign: 'center' }}>{t('notDiagnosis')}</Sub>
            </Card>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SP.sm }}>
                <Ionicons name="bulb-outline" size={20} color={C.primaryDeep} />
                <H2>{t('recommend')}</H2>
              </View>
              {((RECO[id!] as any)?.[lang] || (RECO[id!] as any)?.en || []).map(
                (r: string, i: number) => (
                  <StepLine key={i} ok>
                    {r}
                  </StepLine>
                )
              )}
            </Card>
            <Btn
              title={saving ? '…' : t('saveResult')}
              onPress={save}
              style={{ marginBottom: SP.md }}
            />
            <Btn
              title={t('history')}
              kind="ghost"
              onPress={() => router.push('/history')}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg, paddingTop: SP.sm, paddingBottom: 40 },
  count: { color: C.muted, fontSize: 13, marginTop: SP.sm },
  opt: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: SP.lg,
    marginTop: SP.sm,
  },
  optText: { fontSize: 15, color: C.text, fontWeight: '500' },
  resultLabel: { fontSize: 16, color: C.muted },
});
