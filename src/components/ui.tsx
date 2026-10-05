import { ReactNode } from "react";
import { SymbolView } from "expo-symbols";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextProps,
  View,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { font, radii, space, useTheme } from "../theme";

type TP = TextProps & { size?: number; color?: string };
// Native type metrics and Dynamic Type throughout the mobile app.
export function Display({
  size = 24,
  color,
  weight = "bold",
  style,
  ...p
}: TP & { weight?: "bold" | "medium" }) {
  const t = useTheme();
  return (
    <Text
      {...p}
      style={[
        {
          fontWeight: weight === "bold" ? "700" : "600",
          fontSize: size,
          color: color ?? t.ink,
          letterSpacing: -0.3,
        },
        style,
      ]}
    />
  );
}
export function Body({ size = 17, color, style, ...p }: TP) {
  const t = useTheme();
  return (
    <Text
      {...p}
      style={[
        {
          fontSize: size,
          lineHeight: Math.round(size * 1.45),
          color: color ?? t.ink,
        },
        style,
      ]}
    />
  );
}
export function Mono({ size = 13, color, style, ...p }: TP) {
  const t = useTheme();
  return (
    <Text
      {...p}
      style={[
        {
          fontFamily: font.mono,
          fontSize: size,
          color: color ?? t.inkSecondary,
        },
        style,
      ]}
    />
  );
}
export function Rule({ inset = 0 }: { inset?: number }) {
  const t = useTheme();
  return (
    <View style={{ height: 1, backgroundColor: t.rule, marginLeft: inset }} />
  );
}
export function SectionHeader({
  label,
  meta,
}: {
  label: string;
  meta?: string;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: space.l,
        marginTop: 28,
        marginBottom: space.m,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: space.s,
      }}
    >
      <Display size={19} style={{ flexGrow: 1 }}>
        {label}
      </Display>
      {meta ? (
        <Body size={13} color={t.inkSecondary}>
          {meta}
        </Body>
      ) : null}
    </View>
  );
}
export type IconName =
  | "feed"
  | "settings"
  | "scan"
  | "close"
  | "chevron"
  | "link";
const SYMBOLS = {
  feed: { ios: "list.bullet", android: "list" },
  settings: { ios: "gearshape", android: "settings" },
  scan: { ios: "qrcode.viewfinder", android: "qr_code_scanner" },
  close: { ios: "xmark", android: "close" },
  chevron: { ios: "chevron.right", android: "chevron_right" },
  link: { ios: "link", android: "link" },
} as const;

export function Icon({
  name,
  color,
  size = 24,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  const t = useTheme();
  return (
    <SymbolView
      name={SYMBOLS[name]}
      tintColor={color ?? t.ink}
      size={size}
      style={{ width: size, height: size }}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
export function Brand({ size = 36 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/icon/adder-icon.png")}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessible={false}
    />
  );
}
export function Button({
  title,
  onPress,
  tone = "primary",
  disabled,
  loading,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "alarm";
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: ViewStyle;
}) {
  const t = useTheme();
  const bg = { primary: t.accent, secondary: t.accentSoft, alarm: t.alarmSoft }[
    tone
  ];
  const fg = { primary: t.onAccent, secondary: t.accent, alarm: t.alarm }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: Boolean(disabled || loading),
        busy: Boolean(loading),
      }}
      disabled={disabled || loading}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        {
          minHeight: 52,
          paddingVertical: 14,
          paddingHorizontal: space.l,
          borderRadius: radii.control,
          backgroundColor: bg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : icon ? (
        <Icon name={icon} color={fg} size={20} />
      ) : null}
      <Display
        size={16}
        color={fg}
        style={{ flexShrink: 1, textAlign: "center" }}
      >
        {title}
      </Display>
    </Pressable>
  );
}
export function Empty({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ padding: space.xl, gap: space.m }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radii.control,
          backgroundColor: t.accentSoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: space.s,
        }}
      >
        <Icon name="feed" color={t.accent} />
      </View>
      <Display size={23}>{title}</Display>
      <Body color={t.inkSecondary}>{message}</Body>
      {children}
    </View>
  );
}
