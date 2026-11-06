import { useEffect, useState, type RefObject } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { Body, Icon } from "./ui";
import { space, useTheme } from "../theme";

export type Tab = "feed" | "settings";
export default function TabBar({
  tab,
  onChange,
  blurTarget,
  onHeightChange,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  blurTarget: RefObject<View | null>;
  onHeightChange: (height: number) => void;
}) {
  const t = useTheme();
  const dark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const [reduceTransparency, setReduceTransparency] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (mounted) setReduceTransparency(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  const liquidGlass =
    !reduceTransparency &&
    Platform.OS === "ios" &&
    isGlassEffectAPIAvailable() &&
    isLiquidGlassAvailable();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: space.l,
        right: space.l,
        bottom: Math.max(insets.bottom, space.m),
        alignItems: "center",
      }}
    >
      <View
        onLayout={(event) => onHeightChange(event.nativeEvent.layout.height)}
        style={{
          width: "100%",
          maxWidth: 360,
          borderRadius: 36,
          shadowColor: "#271A10",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: dark ? 0.3 : 0.16,
          shadowRadius: 18,
          elevation: 8,
        }}
      >
        <View style={{ borderRadius: 36, overflow: "hidden" }}>
          {reduceTransparency ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: t.card }]} />
          ) : liquidGlass ? (
            <GlassView
              pointerEvents="none"
              glassEffectStyle="regular"
              tintColor={dark ? "rgba(43,34,27,0.3)" : "rgba(244,239,231,0.3)"}
              style={[StyleSheet.absoluteFill, { borderRadius: 36 }]}
            />
          ) : (
            <BlurView
              pointerEvents="none"
              blurTarget={blurTarget}
              blurMethod="dimezisBlurViewSdk31Plus"
              intensity={75}
              tint={dark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: dark ? "rgba(43,34,27,0.72)" : "rgba(244,239,231,0.72)" },
                ]}
              />
            </BlurView>
          )}
          <View style={{ flexDirection: "row", padding: 6, gap: 6 }}>
            {(["feed", "settings"] as const).map((key) => {
              const active = key === tab;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={key === "feed" ? "Feed" : "Settings"}
                  onPress={() => {
                    if (!active) {
                      void Haptics.selectionAsync();
                      onChange(key);
                    }
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 60,
                    borderRadius: 30,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    backgroundColor: active ? t.accent : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Icon name={key} size={22} color={active ? t.onAccent : t.ink} />
                  <Body
                    size={12}
                    color={active ? t.onAccent : t.ink}
                    style={{ fontWeight: active ? "600" : "400", textAlign: "center" }}
                  >
                    {key === "feed" ? "Feed" : "Settings"}
                  </Body>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
