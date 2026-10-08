import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Btn } from '../components/ui';
import { useLang } from '../i18n';
import { C, SP, R } from '../theme';

const PAGES = [
  { icon: 'heart-outline', tk: 'ob1t', dk: 'ob1d' },
  { icon: 'scan-outline', tk: 'ob2t', dk: 'ob2d' },
  { icon: 'sparkles-outline', tk: 'ob3t', dk: 'ob3d' },
];

export default function Onboarding() {
  const { t } = useLang();
  const [page, setPage] = useState(0);

  const done = async () => {
    await AsyncStorage.setItem('cv_onboard', '1');
    router.replace('/auth');
  };

  const p = PAGES[page];

  return (
    <Screen>
      <View style={styles.wrap}>
        <TouchableOpacity onPress={done} style={styles.skip}>
          <Text style={styles.skipText}>{t('skip')}</Text>
        </TouchableOpacity>
        <View style={styles.iconBox}>
          <Ionicons name={p.icon as any} size={64} color={C.primaryDeep} />
        </View>
        <Text style={styles.title}>{t(p.tk)}</Text>
        <Text style={styles.desc}>{t(p.dk)}</Text>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === page && styles.dotOn]}
            />
          ))}
        </View>
        <View style={styles.btns}>
          {page < PAGES.length - 1 ? (
            <Btn title={t('next')} onPress={() => setPage(page + 1)} />
          ) : (
            <Btn title={t('getStarted')} onPress={done} />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: SP.xl, justifyContent: 'center' },
  skip: { position: 'absolute', top: SP.lg, right: SP.xl },
  skipText: { color: C.muted, fontSize: 15, fontWeight: '600' },
  iconBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: C.panel,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SP.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: SP.sm,
  },
  desc: {
    fontSize: 16,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SP.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SP.xl,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  dotOn: { backgroundColor: C.primary, width: 24 },
  btns: { marginTop: SP.xxl },
});
