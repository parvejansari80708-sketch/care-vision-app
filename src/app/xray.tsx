import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
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
  StepLine,
  H2,
  Sub,
} from '../components/ui';
import { useLang } from '../i18n';
import { pickScanImage } from '../lib/scan-image';
import { analyzeImage } from '../lib/ai';
import { saveScan } from '../lib/db';
import { sharePdf } from '../lib/pdf';
import { C, SP } from '../theme';

type Phase = 'upload' | 'analyzing' | 'result' | 'error';

export default function XrayScan() {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState<Phase>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [errMsg, setErrMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const pick = async (fromCamera: boolean) => {
    try {
      const uri = await pickScanImage(fromCamera);
      if (uri) {
        setImage(uri);
        analyze(uri);
      }
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
  };

  const analyze = async (uri?: string) => {
    const img = uri || image;
    if (!img) return;
    setPhase('analyzing');
    try {
      const r = await analyzeImage('xray', img, lang);
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
      await saveScan({ kind: 'xray', result, lang });
      Alert.alert(t('savedOk'));
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setSaving(false);
    }
  };

  const pdf = async () => {
    if (!result) return;
    await sharePdf('X-ray Explanation', [
      { h: t('finding'), b: (result.observations || []).join('\n') },
      { h: t('means'), b: result.whatItMeans || '' },
      { h: t('impression'), b: result.impression || '' },
    ]);
  };

  return (
    <Screen>
      <TopBar title={t('xrayTitle')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {phase === 'upload' && (
          <Card style={{ alignItems: 'center', paddingVertical: SP.xl }}>
            <TouchableOpacity
              onPress={() => pick(false)}
              style={styles.scanbox}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-outline" size={44} color={C.primaryDeep} />
              <Text style={styles.scanText}>
                {t('takePhoto')} / {t('uploadImage')}
              </Text>
              <Sub>{t('tapTo')}</Sub>
            </TouchableOpacity>
            <View style={{ height: SP.md }} />
            <Btn title={t('takePhoto')} kind="ghost" onPress={() => pick(true)} />
          </Card>
        )}

        {phase === 'analyzing' && (
          <Card style={{ alignItems: 'center', paddingVertical: 40 }}>
            {image && (
              <Image source={{ uri: image }} style={styles.thumb} />
            )}
            <ActivityIndicator size="large" color={C.primary} />
            <View style={{ height: SP.lg }} />
            <StepLine>{t('reading1')}</StepLine>
            <StepLine>{t('reading2')}</StepLine>
          </Card>
        )}

        {phase === 'error' && (
          <View>
            <Card style={{ alignItems: 'center', paddingVertical: SP.xl }}>
              <Ionicons name="alert-circle-outline" size={48} color={C.red} />
              <H2>{t('error')}</H2>
              <Sub style={{ textAlign: 'center' }}>{errMsg}</Sub>
            </Card>
            <Btn title={t('tryAgain')} onPress={() => analyze()} />
          </View>
        )}

        {phase === 'result' && result && (
          <View>
            <Card>
              <H2>{t('finding')}</H2>
              <Sub style={{ color: C.muted, marginBottom: SP.sm }}>
                Educational only — not a diagnosis
              </Sub>
              {(result.observations || []).map((o: string, i: number) => (
                <StepLine key={i} ok>
                  {o}
                </StepLine>
              ))}
              {result.whatItMeans ? (
                <View style={styles.kv}>
                  <Text style={styles.kvLabel}>{t('means')}</Text>
                  <Text style={styles.kvVal}>{result.whatItMeans}</Text>
                </View>
              ) : null}
              {result.impression ? (
                <View style={styles.kv}>
                  <Text style={styles.kvLabel}>{t('impression')}</Text>
                  <Text style={styles.kvVal}>{result.impression}</Text>
                </View>
              ) : null}
              {(result.guidance || []).map((g: string, i: number) => (
                <StepLine key={'g' + i} ok>
                  {g}
                </StepLine>
              ))}
              {result.disclaimer ? (
                <Sub style={{ marginTop: SP.sm }}>{result.disclaimer}</Sub>
              ) : null}
            </Card>
            <Btn
              title={saving ? '…' : t('saveResult')}
              onPress={save}
              style={{ marginBottom: SP.sm }}
            />
            <Btn title={t('genPdf')} kind="ghost" onPress={pdf} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg, paddingTop: SP.sm, paddingBottom: 40 },
  scanbox: { alignItems: 'center', padding: SP.lg },
  scanText: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: SP.sm },
  thumb: { width: '100%', height: 220, borderRadius: 14, marginBottom: SP.lg },
  kv: { marginTop: SP.md },
  kvLabel: { fontSize: 13, color: C.muted, marginBottom: 4, fontWeight: '600' },
  kvVal: { fontSize: 15, color: C.text2, lineHeight: 22 },
});
