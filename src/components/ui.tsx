import React, { type ReactNode, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, R, SP, SHADOW } from '../theme';

// ---------- Screen wrapper ----------
export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

// ---------- Top bar ----------
export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View style={styles.topbar}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
      <Text style={styles.topTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

// ---------- Card ----------
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---------- Buttons (springy press animation) ----------
export function Btn({
  title,
  onPress,
  kind = 'primary',
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'dark';
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const s = useRef(new Animated.Value(1)).current;
  const down = () =>
    Animated.spring(s, {
      toValue: 0.97,
      speed: 60,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  const up = () =>
    Animated.spring(s, {
      toValue: 1,
      speed: 60,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={down}
        onPressOut={up}
        activeOpacity={0.85}
        style={[
          styles.btn,
          kind === 'primary' && styles.btnPrimary,
          kind === 'ghost' && styles.btnGhost,
          kind === 'dark' && styles.btnDark,
        ]}
      >
        <Text
          style={[
            styles.btnText,
            kind === 'ghost' && { color: C.primaryDeep },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------- Chips ----------
export function Chip({
  tone,
  children,
}: {
  tone: 'green' | 'amber' | 'red' | 'gray';
  children: ReactNode;
}) {
  const bg =
    tone === 'green'
      ? C.greenBg
      : tone === 'amber'
        ? C.amberBg
        : tone === 'red'
          ? C.redBg
          : C.tint;
  const fg =
    tone === 'green'
      ? C.green
      : tone === 'amber'
        ? C.amber
        : tone === 'red'
          ? C.red
          : C.text3;
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipText, { color: fg }]}>{children}</Text>
    </View>
  );
}

export function RiskChip({ level }: { level: 'low' | 'moderate' | 'high' }) {
  const tone = level === 'low' ? 'green' : level === 'high' ? 'red' : 'amber';
  const label = level === 'low' ? 'Low' : level === 'high' ? 'High' : 'Moderate';
  return <Chip tone={tone as any}>{label}</Chip>;
}

// ---------- Text field ----------
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboard,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboard?: 'default' | 'email-address' | 'numeric';
}) {
  return (
    <View style={{ marginBottom: SP.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.inactive}
        secureTextEntry={secure}
        keyboardType={keyboard}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

// ---------- Segmented control ----------
export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.seg}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.v}
          onPress={() => onChange(o.v)}
          style={[styles.segBtn, value === o.v && styles.segBtnOn]}
        >
          <Text
            style={[styles.segText, value === o.v && styles.segTextOn]}
          >
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------- Progress bar ----------
export function PBar({ progress }: { progress: number }) {
  return (
    <View style={styles.pbar}>
      <View
        style={[
          styles.pbarFill,
          { width: `${Math.max(0, Math.min(100, progress * 100))}%` },
        ]}
      />
    </View>
  );
}

// ---------- Step line ----------
export function StepLine({
  ok,
  children,
}: {
  ok?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.stepLine}>
      <View
        style={[
          styles.stepDot,
          { backgroundColor: ok ? C.greenBg : C.tint },
        ]}
      >
        <Ionicons
          name={ok ? 'checkmark' : 'ellipse'}
          size={14}
          color={ok ? C.green : C.primary}
        />
      </View>
      <Text style={styles.stepText}>{children}</Text>
    </View>
  );
}

// ---------- Menu row ----------
export function MenuRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuRow}>
      <View style={styles.menuIcon}>
        <Ionicons
          name={icon as any}
          size={20}
          color={danger ? C.red : C.primaryDeep}
        />
      </View>
      <Text
        style={[styles.menuLabel, danger && { color: C.red }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={C.inactive} />
    </TouchableOpacity>
  );
}

// ---------- Empty note ----------
export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <Card>
      <Text style={styles.sub}>{children}</Text>
    </Card>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <Text style={styles.h2}>{children}</Text>;
}
export function Sub({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.sub, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.lg,
    paddingVertical: SP.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: SP.lg,
    marginBottom: SP.md,
    ...SHADOW,
  },
  btn: {
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: C.primary },
  btnDark: { backgroundColor: C.black },
  btnGhost: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  btnText: { color: C.white, fontSize: 16, fontWeight: '700' },
  chip: {
    borderRadius: 999,
    paddingHorizontal: SP.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text3,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: SP.lg,
    paddingVertical: 13,
    fontSize: 16,
    color: C.text,
  },
  seg: {
    flexDirection: 'row',
    backgroundColor: C.tint,
    borderRadius: R.md,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    borderRadius: R.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segBtnOn: { backgroundColor: C.card, ...SHADOW },
  segText: { fontSize: 14, fontWeight: '600', color: C.muted },
  segTextOn: { color: C.text },
  pbar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: C.tint,
    overflow: 'hidden',
  },
  pbarFill: { height: 8, borderRadius: 4, backgroundColor: C.primary },
  stepLine: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SP.sm },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SP.sm,
  },
  stepText: { flex: 1, fontSize: 14, color: C.text2, lineHeight: 20 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SP.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SP.md,
  },
  menuLabel: { flex: 1, fontSize: 15, color: C.text, fontWeight: '500' },
  h2: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: SP.sm },
  sub: { fontSize: 14, color: C.muted, lineHeight: 20 },
});
