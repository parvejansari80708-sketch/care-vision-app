import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, TopBar, Btn, Field, EmptyNote, Sub } from '../components/ui';
import { useLang } from '../i18n';
import {
  getReminders,
  addReminder,
  toggleReminder,
  deleteReminder,
} from '../lib/db';
import { C, SP } from '../theme';

type Rem = { id: string; title: string; time: string; on: boolean };

export default function Reminders() {
  const { t } = useLang();
  const [list, setList] = useState<Rem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const d = await getReminders();
      setList(
        d.map((x: any) => ({
          id: x.id,
          title: x.title,
          time: x.time,
          on: !!x.on,
        }))
      );
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    try {
      await addReminder({ title: title.trim(), time: time.trim() || '09:00', on: true });
      setTitle('');
      setTime('');
      load();
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
  };

  const toggle = async (r: Rem) => {
    try {
      await toggleReminder(r.id, !r.on);
      setList((l) => l.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x)));
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
  };

  const del = (r: Rem) => {
    Alert.alert(t('delete'), r.title, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteReminder(r.id);
          load();
        },
      },
    ]);
  };

  return (
    <Screen>
      <TopBar title={t('reminders')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
        ) : list.length === 0 ? (
          <EmptyNote>{t('noReminders')}</EmptyNote>
        ) : (
          list.map((r) => (
            <Card key={r.id} style={styles.row}>
              <Ionicons name="alarm-outline" size={24} color={C.primaryDeep} />
              <View style={{ flex: 1, marginLeft: SP.md }}>
                <Text style={styles.title}>{r.title}</Text>
                <Text style={styles.time}>{r.time}</Text>
              </View>
              <Switch
                value={r.on}
                onValueChange={() => toggle(r)}
                trackColor={{ true: C.primary }}
              />
              <TouchableOpacity onPress={() => del(r)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={C.red} />
              </TouchableOpacity>
            </Card>
          ))
        )}

        <Card style={{ marginTop: SP.lg }}>
          <Sub style={{ fontWeight: '700', marginBottom: SP.sm }}>
            {t('addReminder')}
          </Sub>
          <Field
            value={title}
            onChangeText={setTitle}
            placeholder={t('remTitle')}
          />
          <Field
            value={time}
            onChangeText={setTime}
            placeholder={t('remTime') + ' (09:00)'}
          />
          <Btn title={t('addReminder')} onPress={add} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SP.lg, paddingTop: SP.sm, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: C.text },
  time: { fontSize: 13, color: C.muted, marginTop: 2 },
});
