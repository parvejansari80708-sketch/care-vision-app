import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  Card,
  TopBar,
  Seg,
  EmptyNote,
  Sub,
  H2,
  StepLine,
  RiskChip,
} from '../components/ui';
import { useLang } from '../i18n';
import { getAssessments, getScans, getChatSessions } from '../lib/db';
import { MODS, RECO } from '../data/health';
import { C, SP } from '../theme';

type Cat = 'all' | 'assess' | 'scan' | 'chat';

function prettyKind(k: string) {
  return k === 'skin' ? 'Face & Skin' : k === 'xray' ? 'X-ray' : k === 'report' ? 'Lab Report' : k;
}

function sevOf(v: any): 'low' | 'moderate' | 'high' {
  return v === 'low' ? 'low' : v === 'high' ? 'high' : 'moderate';
}

function ScanDetail({ item }: { item: any }) {
  const r = item.result || {};
  const kind = item.kind;
  return (
    <View style={styles.detail}>
      {kind === 'skin' && (
        <View>
          <View style={styles.rowBetween}>
            <H2>Findings</H2>
            <RiskChip level={sevOf(r.severity)} />
          </View>
          {(r.possibleFindings || []).map((p: any, i: number) => (
            <View key={i} style={{ marginTop: SP.sm }}>
              <Text style={styles.finding}>{p.label}</Text>
              {p.notes ? <Sub>{p.notes}</Sub> : null}
            </View>
          ))}
          {(r.observations || []).length > 0 && (
            <View style={styles.kv}>
              <Text style={styles.kvLabel}>Notes</Text>
              <Text style={styles.kvVal}>{(r.observations || []).join(' · ')}</Text>
            </View>
          )}
          {(r.guidance || []).map((g: string, i: number) => (
            <StepLine key={'g' + i} ok>
              {g}
            </StepLine>
          ))}
          {(r.seeDoctorWhen || []).length > 0 && (
            <Sub style={{ marginTop: SP.sm, fontWeight: '700' }}>See a doctor when:</Sub>
          )}
          {(r.seeDoctorWhen || []).map((g: string, i: number) => (
            <StepLine key={'d' + i}>{g}</StepLine>
          ))}
          {r.disclaimer ? <Sub style={{ marginTop: SP.sm }}>{r.disclaimer}</Sub> : null}
        </View>
      )}
      {kind === 'xray' && (
        <View>
          <H2>Finding</H2>
          {(r.observations || []).map((o: string, i: number) => (
            <StepLine key={i} ok>
              {o}
            </StepLine>
          ))}
          {r.whatItMeans ? (
            <View style={styles.kv}>
              <Text style={styles.kvLabel}>Means</Text>
              <Text style={styles.kvVal}>{r.whatItMeans}</Text>
            </View>
          ) : null}
          {r.impression ? (
            <View style={styles.kv}>
              <Text style={styles.kvLabel}>Impression</Text>
              <Text style={styles.kvVal}>{r.impression}</Text>
            </View>
          ) : null}
          {(r.guidance || []).map((g: string, i: number) => (
            <StepLine key={'g' + i} ok>
              {g}
            </StepLine>
          ))}
          {r.disclaimer ? <Sub style={{ marginTop: SP.sm }}>{r.disclaimer}</Sub> : null}
        </View>
      )}
      {kind === 'report' && (
        <View>
          <H2>Report values</H2>
          {(r.values || []).map((v: any, i: number) => (
            <View key={i} style={styles.kv}>
              <Text style={styles.param}>{v.param}</Text>
              <Text style={styles.meta}>
                {v.value} {v.unit || ''} · ref: {v.refRange || '—'} · {v.status}
              </Text>
            </View>
          ))}
          {r.summary ? <Sub style={{ marginTop: SP.sm }}>{r.summary}</Sub> : null}
          {(r.guidance || []).map((g: string, i: number) => (
            <StepLine key={'g' + i} ok>
              {g}
            </StepLine>
          ))}
          {r.disclaimer ? <Sub style={{ marginTop: SP.sm }}>{r.disclaimer}</Sub> : null}
        </View>
      )}
    </View>
  );
}

function AssessDetail({ item, lang }: { item: any; lang: string }) {
  const recos: string[] = ((RECO[item.module] as any)?.[lang] ||
    (RECO[item.module] as any)?.en ||
    []) as string[];
  const mod = (MODS as any[]).find((m) => m.id === item.module);
  const title = mod?.[lang] || mod?.en || item.module;
  return (
    <View style={styles.detail}>
      <View style={styles.rowBetween}>
        <H2>{title}</H2>
        <RiskChip level={sevOf(item.risk)} />
      </View>
      <Sub>
        Risk: {item.risk} · {(item.answers || []).length} questions answered
      </Sub>
      <View style={{ height: SP.sm }} />
      {recos.map((r: string, i: number) => (
        <StepLine key={i} ok>
          {r}
        </StepLine>
      ))}
    </View>
  );
}

function ChatDetail({ item }: { item: any }) {
  return (
    <View style={styles.detail}>
      {(item.messages || []).map((m: any, i: number) => (
        <View key={i} style={[styles.msg, m.r === 'u' ? styles.umsg : styles.amsg]}>
          <Text style={styles.msgText}>{m.x}</Text>
        </View>
      ))}
    </View>
  );
}

export default function History() {
  const { t, lang } = useLang();
  const [cat, setCat] = useState<Cat>('all');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [a, s, c] = await Promise.all([
          getAssessments().catch(() => []),
          getScans().catch(() => []),
          getChatSessions().catch(() => []),
        ]);
        const all = [
          ...a.map((x: any) => ({
            ...x,
            type: 'assess',
            label: `${x.module} — ${x.risk}`,
            date: x.createdAt?.toDate?.()?.toLocaleDateString?.() || '',
          })),
          ...s.map((x: any) => ({
            ...x,
            type: 'scan',
            label: `${prettyKind(x.kind)} scan`,
            date: x.createdAt?.toDate?.()?.toLocaleDateString?.() || '',
          })),
          ...c.map((x: any) => ({
            ...x,
            type: 'chat',
            label: `Chat (${(x.messages || []).length} msgs)`,
            date: x.createdAt?.toDate?.()?.toLocaleDateString?.() || '',
          })),
        ];
        setItems(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const list = items.filter((i) => cat === 'all' || i.type === cat);
  const toggle = (id: string) => setOpenId((o) => (o === id ? null : id));

  return (
    <Screen>
      <TopBar title={t('histTitle')} onBack={() => router.back()} />
      <View style={{ paddingHorizontal: SP.lg, paddingTop: SP.sm }}>
        <Seg
          options={[
            { v: 'all', label: 'All' },
            { v: 'assess', label: 'Assess' },
            { v: 'scan', label: 'Scan' },
            { v: 'chat', label: 'Chat' },
          ]}
          value={cat}
          onChange={setCat}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
        ) : list.length === 0 ? (
          <EmptyNote>{t('noHist')}</EmptyNote>
        ) : (
          list.map((it, i) => {
            const key = it.id || String(i);
            const open = openId === key;
            return (
              <TouchableOpacity key={key} onPress={() => toggle(key)} activeOpacity={0.8}>
                <Card>
                  <Text style={styles.label}>{it.label}</Text>
                  <Sub>
                    {it.date} · {it.type}
                    {open ? ' ▲' : ' ▼'}
                  </Sub>
                  {open && it.type === 'scan' && <ScanDetail item={it} />}
                  {open && it.type === 'assess' && <AssessDetail item={it} lang={lang} />}
                  {open && it.type === 'chat' && <ChatDetail item={it} />}
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  detail: {
    marginTop: SP.md,
    paddingTop: SP.md,
    borderTopWidth: 1,
    borderTopColor: '#EEE7EE',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finding: { fontSize: 15, fontWeight: '700', color: C.text },
  kv: { marginTop: SP.md },
  kvLabel: { fontSize: 13, color: C.muted, marginBottom: 4, fontWeight: '600' },
  kvVal: { fontSize: 15, color: C.text2, lineHeight: 22 },
  param: { fontSize: 15, fontWeight: '700', color: C.text },
  meta: { fontSize: 13, color: C.muted, marginTop: 2 },
  msg: {
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    maxWidth: '88%',
  },
  umsg: { backgroundColor: '#F4ECF8', alignSelf: 'flex-end' },
  amsg: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEE7EE', alignSelf: 'flex-start' },
  msgText: { fontSize: 14, color: C.text, lineHeight: 20 },
});
