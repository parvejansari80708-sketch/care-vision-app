import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R, SHADOW } from '../theme';
import { useLang } from '../i18n';

// Minimal structural type for the tab bar props (avoids @react-navigation types)
type TabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    emit: (e: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented?: boolean };
    navigate: (name: string) => void;
  };
};

const TABS: Record<string, { icon: string; mci?: boolean; label: string }> = {
  index: { icon: 'home-outline', label: 'home' },
  health: { icon: 'heart-outline', label: 'health' },
  scan: { icon: 'line-scan', label: 'scan', mci: true },
  assistant: { icon: 'chatbubble-outline', label: 'assistant' },
  profile: { icon: 'person-outline', label: 'profile' },
};

const ACTIVE: Record<string, string> = {
  index: 'home',
  health: 'heart',
  scan: 'line-scan',
  assistant: 'chatbubble',
  profile: 'person',
};

function TabButton({
  focused,
  onPress,
  icon,
  activeIcon,
  label,
  mci,
}: {
  focused: boolean;
  onPress: () => void;
  icon: string;
  activeIcon: string;
  label: string;
  mci?: boolean;
}) {
  // 0 = inactive, 1 = active — spring animates the purple capsule in/out
  const v = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(v, {
      toValue: focused ? 1 : 0,
      speed: 18,
      bounciness: 9,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const Icon: any = mci ? MaterialCommunityIcons : Ionicons;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tab}
    >
      <Animated.View
        style={[
          styles.pill,
          { opacity: v, transform: [{ scale }] },
        ]}
      />
      <Icon
        name={(focused ? activeIcon : icon) as any}
        size={22}
        color={focused ? '#fff' : C.inactive}
      />
      <Text
        style={[styles.label, focused && styles.labelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function TabBar(props: any) {
  const { state, navigation } = props as TabBarProps;
  const insets = useSafeAreaInsets();
  const { t } = useLang();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const cfg = TABS[route.name] || TABS.index;
        const onPress = () => {
          const ev = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !ev.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <TabButton
            key={route.key}
            focused={focused}
            onPress={onPress}
            icon={cfg.icon}
            activeIcon={ACTIVE[route.name] || cfg.icon}
            label={t(cfg.label)}
            mci={cfg.mci}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
    ...SHADOW,
    shadowOpacity: 0.18,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: R.lg,
    gap: 3,
  },
  pill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: C.primary,
    borderRadius: R.lg,
  },
  label: { fontSize: 10.5, color: C.inactive, fontWeight: '600' },
  labelActive: { color: '#fff' },
});
