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
  StepLine,
  H2,
  Sub,
  Chip,
} from '../components/ui';
import { useLang } from '../i18n';
import { pickScanImage } from '../lib/scan-image';
import { analyzeImage } from '../lib/ai';
import { saveScan } from '../lib/db';
import { sharePdf } from '../lib/pdf';
import { C, SP, R } from '../theme';

type Phase = 'upload' | 'analyzing' | 'result' | 'error';

export default function ReportScan() {
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
      const r = await analyzeImage('report', img, lang);
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
      await saveScan({ kind: 'report', result, lang });
      Alert.alert(t('savedOk'));
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setSaving(false);
    }
  };

  const pdf = async () => {
    if (!result) return;
    const rows = (result.values || [])
      .map((v: any) => `${v.param}: ${v.value} ${v.unit || ''} (ref ${v.refRange || '—'}) [${v.status}]`)
      .join('\n');
    await sharePdf('Lab Report Analysis', [
      { h: t('reportScan'), b: rows },
      { h: t('simpleExplanation'), b: result.summary || '' },
      { h: t('guidance'), b: (result.guidance || []).join('\n') },
    ]);
  };

  const statusChip = (s: string) =>
    s === 'low' ? (
      <Chip tone="amber">▼ Low</Chip>
    ) : s === 'high' ? (
      <Chip tone="red">▲ High</Chip>
    ) : s === 'normal' ? (
      <Chip tone="green">● Normal</Chip>
    ) : (
      <Chip tone="gray">?</Chip>
    );

  return (
    <Screen>
      <TopBar title={t('reportScan')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {phase === 'upload' && (
          <View>
            <Card>
              <Sub>{t('reportExpl')}</Sub>
            </Card>
            <Card style={{ alignItems: 'center', paddingVertical: SP.xl }}>
              <TouchableOpacity
                onPress={() => pick(false)}
                style={styles.scanbox}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text-outline" size={44} color={C.primaryDeep} />
                <Text style={styles.scanText}>
                  {t('takePhoto')} / {t('uploadImage')}
                </Text>
                <Sub>{t('tapTo')}</Sub>
              </TouchableOpacity>
              <View style={{ height: SP.md }} />
              <Btn title={t('takePhoto')} kind="ghost" onPress={() => pick(true)} />
            </Card>
          </View>
        )}

        {phase === 'analyzing' && (
          <Card style={{ alignItems: 'center', paddingVertical: 40 }}>
            {image && <Image source={{ uri: image }} style={styles.thumb} />}
            <ActivityIndicator size="large" color={C.primary} />
            <View style={{ height: SP.lg }} />
            <StepLine>{t('reading1')}</StepLine>
            <StepLine>{t('reading2')}</StepLine>
            <StepLine>{t('reading3')}</StepLine>
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
            <Card style={{ paddingHorizontal: SP.lg, paddingVertical: SP.sm }}>
              <View style={styles.headRow}>
                <Text style={styles.headText}>{t('param')}</Text>
                <Text style={styles.headText}>
                  {t('value')} · {t('status')}
                </Text>
              </View>
              {(result.values || []).map((v: any, i: number) => (
                <View key={i} style={styles.kv}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.param}>{v.param}</Text>
                    <Text style={styles.meta}>
                      {v.value} {v.unit || ''} · {t('reference')}: {v.refRange || '—'}
                    </Text>
                  </View>
                  {statusChip(v.status)}
                </View>
              ))}
            </Card>
            <Card>
              <H2>{t('simpleExplanation')}</H2>
              <Sub>{result.summary}</Sub>
              {(result.guidance || []).map((g: string, i: number) => (
                <StepLine key={i} ok>
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
  thumb: { width: '100%', height: 180, borderRadius: R.md, marginBottom: SP.lg },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SP.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headText: { fontWeight: '700', fontSize: 13, color: C.text3 },
  kv: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SP.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  param: { fontSize: 15, fontWeight: '700', color: C.text },
  meta: { fontSize: 12.5, color: C.muted, marginTop: 2 },
});
