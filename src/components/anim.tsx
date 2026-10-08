// Smooth, native-driven animations used across the app
import React, { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  TouchableOpacity,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';

const EASE = Easing.out(Easing.cubic);

// Fade + rise entrance. Stagger via `delay`.
export function FadeIn({
  children,
  delay = 0,
  y = 16,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  style?: ViewStyle;
}) {
  const op = useRef(new Animated.Value(0)).current;
  const tr = useRef(new Animated.Value(y)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, {
        toValue: 1,
        duration: 380,
        delay,
        easing: EASE,
        useNativeDriver: true,
      }),
      Animated.timing(tr, {
        toValue: 0,
        duration: 380,
        delay,
        easing: EASE,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <Animated.View
      style={[{ opacity: op, transform: [{ translateY: tr }] }, style]}
    >
      {children}
    </Animated.View>
  );
}

// Pressable wrapper with springy scale feedback
export function PressScale({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: ViewStyle;
}) {
  const s = useRef(new Animated.Value(1)).current;
  const down = () =>
    Animated.spring(s, {
      toValue: 0.96,
      speed: 50,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  const up = () =>
    Animated.spring(s, {
      toValue: 1,
      speed: 50,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={down}
        onPressOut={up}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Looping pulse (for analyzing / recording indicators)
export function Pulse({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const s = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(s, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(s, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, style]}>
      {children}
    </Animated.View>
  );
}
