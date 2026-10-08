import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Card,
  Btn,
  TopBar,
  Seg,
  RiskChip,
  StepLine,
  H2,
  Sub,
} from '../components/ui';
import { useLang } from '../i18n';
import { pickScanImage } from '../lib/scan-image';
import { analyzeImage } from '../lib/ai';
import { saveScan } from '../lib/db';
import { sharePdf } from '../lib/pdf';
import { C, SP, R } from '../theme';

type Phase = 'area' | 'capture' | 'preview' | 'analyzing' | 'result' | 'error';

export default function SkinScan() {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState<Phase>('area');
  const [area, setArea] = useState<'face' | 'body'>('face');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [errMsg, setErrMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const pick = async (fromCamera: boolean) => {
    try {
      const uri = await pickScanImage(fromCamera);
      if (uri) {
        setImage(uri);
        setPhase('preview');
      }
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setPhase('analyzing');
    try {
      const r = await analyzeImage('skin', image, lang);
      setResult(r);
      setPhase('result');
    } catch (e: any) {
      setErrMsg(e.message);
      setPhase('error');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveScan({ kind: 'skin', area, result, lang });
      Alert.alert(t('savedOk'));
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setSaving(false);
    }
  };

  const pdf = async () => {
    if (!result) return;
    const findings = (result.possibleFindings || [])
      .map((p: any) => `${p.label}${p.notes ? ' — ' + p.notes : ''}`)
      .join('\n');
    await sharePdf('Skin Scan Result', [
      { h: t('possibleFinding'), b: findings || JSON.stringify(result).slice(0, 500) },
      { h: t('guidance'), b: (result.guidance || []).join('\n') },
      { h: t('explanation'), b: (result.observations || []).join(' ') },
    ]);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setPhase('area');
  };

  const sev: 'low' | 'moderate' | 'high' =
    result?.severity === 'low' ? 'low' : result?.severity === 'high' ? 'high' : 'moderate';

  return (
    <Screen>
      <TopBar title={t('faceSkin')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {phase === 'area' && (
          <View>
            <Card>
              <H2>{t('faceSkin')}</H2>
              <Sub>{t('tapTo')}</Sub>
              <View style={{ height: SP.md }} />
              <Seg
                options={[
                  { v: 'face', label: 'Face' },
                  { v: 'body', label: 'Body' },
                ]}
                value={area}
                onChange={setArea}
              />
            </Card>
            <Btn title={t('next')} onPress={() => setPhase('capture')} />
          </View>
        )}

        {phase === 'capture' && (
          <View>
            <Card style={{ alignItems: 'center', paddingVertical: SP.xl }}>
              <Ionicons name="camera-outline" size={56} color={C.primaryDeep} />
              <View style={{ height: SP.lg }} />
              <Btn
                title={t('takePhoto')}
                onPress={() => pick(true)}
                style={{ width: '100%', marginBottom: SP.md }}
              />
              <Btn
                title={t('uploadImage')}
                kind="ghost"
                onPress={() => pick(false)}
                style={{ width: '100%' }}
              />
            </Card>
          </View>
        )}

        {phase === 'preview' && image && (
          <View>
            <Card style={{ alignItems: 'center' }}>
              <Image source={{ uri: image }} style={styles.img} />
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: SP.sm }}>
                  <Btn title={t('retake')} kind="ghost" onPress={() => setPhase('capture')} />
                </View>
                <View style={{ flex: 1, marginLeft: SP.sm }}>
                  <Btn title={t('usePhoto')} onPress={analyze} />
                </View>
              </View>
            </Card>
          </View>
        )}

        {phase === 'analyzing' && (
          <Card style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={C.primary} />
            <View style={{ height: SP.lg }} />
            <StepLine>{t('analyzing1')}</StepLine>
            <StepLine>{t('analyzing2')}</StepLine>
            <StepLine>{t('analyzing3')}</StepLine>
          </Card>
        )}

        {phase === 'error' && (
          <View>
            <Card style={{ alignItems: 'center', paddingVertical: SP.xl }}>
              <Ionicons name="alert-circle-outline" size={48} color={C.red} />
              <H2>{t('error')}</H2>
              <Sub style={{ textAlign: 'center' }}>{errMsg}</Sub>
            </Card>
            <Btn
              title={t('tryAgain')}
              onPress={analyze}
              style={{ marginBottom: SP.md }}
            />
            <Btn title={t('retake')} kind="ghost" onPress={reset} />
          </View>
        )}

        {phase === 'result' && result && (
          <View>
            <Card>
              <View style={styles.rowBetween}>
                <H2>{t('possibleFinding')}</H2>
                <RiskChip level={sev} />
              </View>
              {(result.possibleFindings || []).map((p: any, i: number) => (
                <View key={i} style={{ marginTop: SP.sm }}>
                  <Text style={styles.finding}>{p.label}</Text>
                  {p.notes ? <Sub>{p.notes}</Sub> : null}
                </View>
              ))}
              {(result.observations || []).length > 0 && (
                <View style={styles.kv}>
                  <Text style={styles.kvLabel}>{t('explanation')}</Text>
                  <Text style={styles.kvVal}>
                    {(result.observations || []).join(' · ')}
                  </Text>
                </View>
              )}
              {result.disclaimer ? (
                <Sub style={{ marginTop: SP.sm }}>{result.disclaimer}</Sub>
              ) : null}
            </Card>
            <Card>
              <H2>{t('guidance')}</H2>
              {(result.guidance || []).map((g: string, i: number) => (
                <StepLine key={i} ok>
                  {g}
                </StepLine>
              ))}
              {(result.seeDoctorWhen || []).length > 0 && (
                <Sub style={{ marginTop: SP.sm, fontWeight: '700' }}>
                  {t('seeDoctorWhen')}:
                </Sub>
              )}
              {(result.seeDoctorWhen || []).map((g: string, i: number) => (
                <StepLine key={'d' + i}>{g}</StepLine>
              ))}
            </Card>
            <View style={styles.grid2}>
              <Btn title={saving ? '…' : t('saveResult')} onPress={save} />
              <View style={{ height: SP.sm }} />
              <Btn title={t('genPdf')} kind="ghost" onPress={pdf} />
              <View style={{ height: SP.sm }} />
              <Btn title={t('retake')} kind="ghost" onPress={reset} />
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg, paddingTop: SP.sm, paddingBottom: 40 },
  img: { width: '100%', height: 320, borderRadius: R.md, marginBottom: SP.lg },
  row: { flexDirection: 'row' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finding: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 4 },
  kv: { marginTop: SP.md },
  kvLabel: { fontSize: 13, color: C.muted, marginBottom: 4 },
  kvVal: { fontSize: 15, color: C.text2, lineHeight: 22 },
  grid2: { marginTop: SP.sm },
});
