import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, TopBar } from '../../components/ui';
import { FadeIn } from '../../components/anim';
import { useLang } from '../../i18n';
import { chatReply } from '../../lib/ai';
import { saveChatSession } from '../../lib/db';
import { C, SP, R } from '../../theme';

type Msg = { r: 'u' | 'a'; x: string };

// Demo fallback (same spirit as prototype) when AI is unreachable
function demoReply(q: string): string {
  const s = q.toLowerCase();
  if (/diabet|sugar|मधुमेह/.test(s))
    return 'Diabetes means blood glucose stays higher than normal. Early signs: thirst, frequent urination, fatigue. Managed with diet, activity and regular checks — general info, not a diagnosis.';
  if (/heart|हृदय|chest/.test(s))
    return 'Heart risk rises with high BP, smoking and inactivity. Chest pain or breathlessness needs urgent care. Prevention: move daily, less salt, no tobacco.';
  if (/diet|खान|food/.test(s))
    return 'Half plate vegetables, quarter whole grains, quarter protein, 2–2.5 L water daily. Less sugar, fried food and salt.';
  if (/sleep|नींद/.test(s))
    return 'Aim 7–8 hours. Fixed bedtime, no screens 1 hour before sleep.';
  return 'I can explain conditions, reports, diet and lifestyle simply. Tell me a bit more? (General info — not a diagnosis.)';
}

export default function Assistant() {
  const { t, lang } = useLang();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      r: 'a',
      x: "Namaste! I'm your Care-Vision AI assistant. Ask about symptoms, reports, diet or exercise.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList>(null);

  const scrollDown = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    const next = [...msgs, { r: 'u' as const, x: q }];
    setMsgs(next);
    scrollDown();
    setBusy(true);
    try {
      let reply: string;
      try {
        reply = await chatReply(
          q,
          lang,
          next.map((m) => ({ r: m.r, x: m.x }))
        );
      } catch {
        reply = demoReply(q);
      }
      setMsgs([...next, { r: 'a', x: reply }]);
    } finally {
      setBusy(false);
      scrollDown();
    }
  };

  const newChat = () => {
    setMsgs([
      {
        r: 'a',
        x: "Namaste! I'm your Care-Vision AI assistant. Ask about symptoms, reports, diet or exercise.",
      },
    ]);
  };

  const save = async () => {
    if (msgs.length < 3) return;
    try {
      await saveChatSession({ messages: msgs, lang });
      Alert.alert(t('savedOk'));
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
  };

  return (
    <Screen>
      <TopBar
        title={t('aiAssistant')}
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={save} hitSlop={8}>
              <Ionicons name="bookmark-outline" size={22} color={C.text3} />
            </TouchableOpacity>
            <TouchableOpacity onPress={newChat} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={22} color={C.text3} />
            </TouchableOpacity>
          </View>
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <FadeIn key={index} delay={0} y={8}>
              <View
                style={[
                  styles.msg,
                  item.r === 'u' ? styles.msgU : styles.msgA,
                ]}
              >
                <Text
                  style={[
                    styles.msgText,
                    item.r === 'u' && { color: '#fff' },
                  ]}
                >
                  {item.x}
                </Text>
              </View>
            </FadeIn>
          )}
        />
        {busy && (
          <View style={styles.typing}>
            <ActivityIndicator size="small" color={C.primary} />
          </View>
        )}
        <View style={styles.bar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('chatPh')}
            placeholderTextColor={C.inactive}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={send} style={styles.send}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: SP.lg, paddingBottom: SP.sm },
  msg: {
    maxWidth: '82%',
    borderRadius: R.md,
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm,
    marginBottom: SP.sm,
  },
  msgU: { alignSelf: 'flex-end', backgroundColor: C.primary },
  msgA: {
    alignSelf: 'flex-start',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  msgText: { fontSize: 15, color: C.text, lineHeight: 21 },
  typing: { paddingLeft: SP.lg, paddingBottom: SP.xs },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.lg,
    paddingBottom: 104,
    paddingTop: SP.sm,
    gap: SP.sm,
  },
  input: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 24,
    paddingHorizontal: SP.lg,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
