import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, useColorScheme } from "react-native";

// Cool observation-log surfaces. Violet is an action, amber is a received event.
export const palettes = {
  light: {
    paper: "#F3F2FA",
    panel: "#E9E5F7",
    card: "#FFFFFF",
    rule: "#DCD8EB",
    ink: "#252137",
    inkSecondary: "#686178",
    accent: "#6442C5",
    accentSoft: "#E7DFFB",
    onAccent: "#FFFFFF",
    signal: "#826000",
    signalSoft: "#F5E8BE",
    alarm: "#B6314B",
    alarmSoft: "#FCE6EA",
    camera: "#141220",
    cameraInk: "#FFFFFF",
    cameraMuted: "#D7D1EA",
  },
  dark: {
    paper: "#191623",
    panel: "#252033",
    card: "#302A40",
    rule: "#463D57",
    ink: "#F1EDF9",
    inkSecondary: "#B7AEC8",
    accent: "#C4ACFF",
    accentSoft: "#3D2E59",
    onAccent: "#241639",
    signal: "#E8C66A",
    signalSoft: "#44391E",
    alarm: "#FF9EB0",
    alarmSoft: "#4B2836",
    camera: "#141220",
    cameraInk: "#FFFFFF",
    cameraMuted: "#D7D1EA",
  },
} as const;
export type Palette = Record<keyof (typeof palettes)["light"], string>;
export const space = { xs: 4, s: 8, m: 12, l: 20, xl: 32 } as const;
export const radii = { card: 16, control: 12 } as const;
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
