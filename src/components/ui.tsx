import { ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { font, radii, space, useTheme } from '../theme';

type TP = TextProps & { size?: number; color?: string };

export function Display({ size = 24, color, weight = 'bold', style, ...p }: TP & { weight?: 'bold' | 'medium' }) {
  const t = useTheme();
  return (
    <Text
      {...p}
      style={[
        { fontFamily: weight === 'bold' ? font.display : font.displayMedium, fontSize: size, color: color ?? t.ink, letterSpacing: size >= 40 ? -1.5 : -0.2 },
        style,
      ]}
    />
  );
}

export function Body({ size = 15, color, style, ...p }: TP) {
  const t = useTheme();
  return <Text {...p} style={[{ fontSize: size, lineHeight: Math.round(size * 1.45), color: color ?? t.ink }, style]} />;
}

export function Mono({ size = 13, color, style, ...p }: TP) {
  const t = useTheme();
  return <Text {...p} style={[{ fontFamily: font.mono, fontSize: size, color: color ?? t.inkSecondary }, style]} />;
}

/** Kerned uppercase section label. */
export function Eyebrow({ color, style, children, ...p }: TP) {
  const t = useTheme();
  return (
    <Text {...p} style={[{ fontFamily: font.displayMedium, fontSize: 12, letterSpacing: 1.5, color: color ?? t.inkSecondary }, style]}>
      {typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );
}

/** A hairline used as an editorial rule, never as a box outline. */
export function Rule({ color, inset = 0, style }: { color?: string; inset?: number; style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ height: 1, backgroundColor: color ?? t.rule, marginLeft: inset }, style]} />;
}

export function SectionHeader({ label, meta }: { label: string; meta?: string }) {
  return (
    <View style={{ paddingHorizontal: space.l, marginTop: space.xl }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.s }}>
        <Eyebrow>{label}</Eyebrow>
        {meta ? <Mono size={12}>{meta}</Mono> : null}
      </View>
      <Rule />
    </View>
  );
}

type Tone = 'ink' | 'copper' | 'ghost' | 'alarm';

export function PillButton({ title, onPress, tone = 'ink', disabled, loading, style }: {
  title: string; onPress: () => void; tone?: Tone; disabled?: boolean; loading?: boolean; style?: ViewStyle;
}) {
  const t = useTheme();
  const [pressed, setPressed] = useState(false);
  const bg = { ink: t.ink, copper: t.copper, ghost: 'transparent', alarm: 'transparent' }[tone];
  const fg = { ink: t.onInk, copper: t.onInk, ghost: t.ink, alarm: t.alarm }[tone];
  const border = tone === 'ghost' ? t.rule : tone === 'alarm' ? t.alarm : bg;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={[
        s.pill,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Display size={17} color={fg}>{title}</Display>}
    </Pressable>
  );
}

/** The house mark: a stack of blocks, the top one — the chain tip — filled. */
export function TipMark({ size = 18, color, tip }: { size?: number; color?: string; tip?: string }) {
  const t = useTheme();
  const ink = color ?? t.ink;
  const h = Math.round(size * 0.22);
  const gap = Math.round((size - h * 3) / 2);
  return (
    <View style={{ width: size, height: size, justifyContent: 'space-between' }} accessibilityElementsHidden importantForAccessibility="no">
      <View style={{ height: h, borderRadius: 2, backgroundColor: tip ?? t.copper }} />
      <View style={{ height: h, borderRadius: 2, borderWidth: 1.5, borderColor: ink, marginTop: gap }} />
      <View style={{ height: h, borderRadius: 2, borderWidth: 1.5, borderColor: ink, marginTop: gap }} />
    </View>
  );
}

export function Empty({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ padding: space.xl, alignItems: 'center', gap: space.m }}>
      <TipMark size={40} color={t.inkSecondary} tip={t.inkSecondary} />
      <Display size={22}>{title}</Display>
      <Body color={t.inkSecondary} style={{ textAlign: 'center' }}>{message}</Body>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: space.l - 4, paddingHorizontal: space.l,
    borderRadius: radii.pill, borderWidth: 1,
  },
});
