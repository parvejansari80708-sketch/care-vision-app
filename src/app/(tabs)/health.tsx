import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, H2, Sub, TopBar } from '../../components/ui';
import { FadeIn } from '../../components/anim';
import { useLang } from '../../i18n';
import { MODS } from '../../data/health';
import { C, SP, R } from '../../theme';

const MOD_ICONS: Record<string, string> = {
  diabetes: 'water-outline',
  heart: 'heart-outline',
  kidney: 'flask-outline',
  liver: 'leaf-outline',
  anemia: 'bandage-outline',
  thyroid: 'pulse-outline',
};

export default function Health() {
  const { t, lang } = useLang();

  return (
    <Screen>
      <TopBar title={t('health')} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Sub style={{ marginBottom: SP.lg }}>{t('ob1d')}</Sub>
        {MODS.map((m, i) => (
          <FadeIn key={m.id} delay={i * 55}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/module/${m.id}` as any)}
            >
              <Card style={styles.row}>
                <View style={styles.icon}>
                  <Ionicons
                    name={MOD_ICONS[m.id] as any}
                    size={28}
                    color={C.primaryDeep}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{(m as any)[lang] || m.en}</Text>
                  <Text style={styles.sub}>
                    {(m.sub as any)[lang] || m.sub.en}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.inactive} />
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
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SP.md,
  },
  name: { fontSize: 17, fontWeight: '700', color: C.text },
  sub: { fontSize: 13.5, color: C.muted, marginTop: 3 },
});
