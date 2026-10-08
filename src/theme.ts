import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, useColorScheme } from "react-native";

// Adder brown and beige, with rounded surfaces and strong reading contrast.
export const palettes = {
  light: {
    paper: "#F4EFE7",
    panel: "#E7DCCB",
    card: "#FFFFFF",
    rule: "#D6C8B7",
    ink: "#2F241C",
    inkSecondary: "#6D5B4C",
    accent: "#713F25",
    accentSoft: "#EAD8C0",
    onAccent: "#FFF9EE",
    signal: "#755026",
    signalSoft: "#EFE1CD",
    alarm: "#A13C2F",
    alarmSoft: "#F4E3DD",
    camera: "#19130F",
    cameraInk: "#FFF9EE",
    cameraMuted: "#DED1C2",
  },
  dark: {
    paper: "#1C1612",
    panel: "#382B21",
    card: "#2B221B",
    rule: "#514032",
    ink: "#F5EDE1",
    inkSecondary: "#C7B5A2",
    accent: "#D0A16D",
    accentSoft: "#453324",
    onAccent: "#271A10",
    signal: "#E1BC84",
    signalSoft: "#453526",
    alarm: "#E4A091",
    alarmSoft: "#492820",
    camera: "#19130F",
    cameraInk: "#FFF9EE",
    cameraMuted: "#DED1C2",
  },
} as const;
export type Palette = Record<keyof (typeof palettes)["light"], string>;
export const space = { xs: 4, s: 8, m: 12, l: 20, xl: 32 } as const;
export const radii = { card: 22, control: 18 } as const;
export const font = {
  mono: Platform.select({ ios: "Menlo", default: "monospace" }) as string,
} as const;
export function useTheme(): Palette {
  return palettes[useColorScheme() === "dark" ? "dark" : "light"];
}
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);
  return reduced;
}
export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return "now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
