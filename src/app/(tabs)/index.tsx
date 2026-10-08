import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Screen, Card, H2, Sub } from '../../components/ui';
import { FadeIn } from '../../components/anim';
import { useLang } from '../../i18n';
import { useAuth } from '../../contexts/auth-context';
import { MODS } from '../../data/health';
import { C, SP, R, SHADOW } from '../../theme';

const MOD_ICONS: Record<string, string> = {
  diabetes: 'water-outline',
  heart: 'heart-outline',
  kidney: 'flask-outline',
  liver: 'leaf-outline',
  anemia: 'bandage-outline',
  thyroid: 'pulse-outline',
};

const ACircle = Animated.createAnimatedComponent(Circle);

function ScoreRing({ score }: { score: number }) {
  const size = 118;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score,
      duration: 1300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const dashOffset = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [circ, 0],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.tint}
          strokeWidth={stroke}
          fill="none"
        />
        <ACircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={styles.scoreNum}>{score}</Text>
        </View>
      </View>
    </View>
  );
}

const PLAN = [
  'Warm water + 15 min walk',
  'Balanced meals + 2L water',
  '30 min activity',
  '7–8 hr sleep, screens off early',
];

export default function Home() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [done, setDone] = useState<boolean[]>([false, false, false, false]);
  const name = user?.isAnonymous
    ? t('guest')
    : user?.email?.split('@')[0] || t('guest');

  const toggle = (i: number) =>
    setDone((d) => d.map((v, j) => (j === i ? !v : v)));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.hello}>
                {t('hello')}, {name}
              </Text>
              <Sub>{t('tagline')}</Sub>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={70}>
          <Card style={styles.scoreCard}>
            <ScoreRing score={78} />
            <View style={{ marginLeft: SP.lg, flex: 1 }}>
              <H2>{t('healthScore')}</H2>
              <Sub>{t('completeMore')}</Sub>
            </View>
          </Card>
        </FadeIn>

        <FadeIn delay={130}>
          <View style={styles.rowBetween}>
            <H2>{t('health')}</H2>
            <TouchableOpacity onPress={() => router.push('/(tabs)/health')}>
              <Text style={styles.seeAll}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        <View style={styles.grid}>
          {MODS.map((m, i) => (
            <FadeIn key={m.id} delay={160 + i * 45} style={styles.modFade}>
              <TouchableOpacity
                style={styles.modCard}
                onPress={() => router.push(`/module/${m.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.modIcon}>
                  <Ionicons
                    name={MOD_ICONS[m.id] as any}
                    size={26}
                    color={C.primaryDeep}
                  />
                </View>
                <Text style={styles.modName}>
                  {(m as any)[lang] || m.en}
                </Text>
                <Text style={styles.modSub} numberOfLines={1}>
                  {(m.sub as any)[lang] || m.sub.en}
                </Text>
                <Text style={styles.viewText}>{t('view')} →</Text>
              </TouchableOpacity>
            </FadeIn>
          ))}
        </View>

        <FadeIn delay={220}>
          <H2>{t('dailyPlan') || 'Daily plan'}</H2>
        </FadeIn>
        <FadeIn delay={260}>
          <Card>
            {PLAN.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={styles.planRow}
                onPress={() => toggle(i)}
              >
                <View
                  style={[
                    styles.check,
                    done[i] && { backgroundColor: C.greenBg },
                  ]}
                >
                  {done[i] && (
                    <Ionicons name="checkmark" size={16} color={C.green} />
                  )}
                </View>
                <Text
                  style={[
                    styles.planText,
                    done[i] && {
                      textDecorationLine: 'line-through',
                      color: C.inactive,
                    },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        </FadeIn>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg, paddingBottom: 110 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SP.lg,
  },
  hello: { fontSize: 22, fontWeight: '800', color: C.text },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  scoreCard: { flexDirection: 'row', alignItems: 'center' },
  scoreNum: { fontSize: 30, fontWeight: '800', color: C.text },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SP.sm,
    marginBottom: SP.sm,
  },
  seeAll: { color: C.primaryDeep, fontWeight: '700', fontSize: 14 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SP.lg,
  },
  modFade: { width: '48%' },
  modCard: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: SP.md,
    ...SHADOW,
  },
  modIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SP.sm,
  },
  modName: { fontSize: 16, fontWeight: '700', color: C.text },
  modSub: { fontSize: 12.5, color: C.muted, marginTop: 2 },
  viewText: {
    color: C.primaryDeep,
    fontWeight: '700',
    fontSize: 13,
    marginTop: SP.sm,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SP.sm,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SP.md,
  },
  planText: { fontSize: 14.5, color: C.text2, flex: 1 },
});
