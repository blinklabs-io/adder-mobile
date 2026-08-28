import { Platform, useColorScheme } from 'react-native';

// Warm paper/ink (dark mode is a designed pair, not an inversion). Copper is
// Adder's tan (#cb9e6e) pushed to AA contrast; it marks "linked" and the one
// primary action. Signal = receiving. Alarm = errors and unlink only.
export const palettes = {
  light: {
    paper: '#F5EFE6', panel: '#EBE2D3', card: '#FFFBF4', rule: '#E3D8C6',
    ink: '#1C1612', inkSecondary: '#6F6457',
    copper: '#8F5E2B', signal: '#4E7A3F', alarm: '#B4321E',
    onInk: '#F5EFE6', onInkMuted: 'rgba(245,239,230,0.6)', onInkTrack: 'rgba(245,239,230,0.18)',
  },
  dark: {
    paper: '#15110D', panel: '#1E1813', card: '#241D17', rule: '#3A312A',
    ink: '#F1E9DC', inkSecondary: '#A99C8C',
    copper: '#D9A96F', signal: '#9CCB8A', alarm: '#FF6E55',
    onInk: '#15110D', onInkMuted: 'rgba(21,17,13,0.6)', onInkTrack: 'rgba(21,17,13,0.18)',
  },
} as const;
export type Palette = Record<keyof (typeof palettes)['light'], string>;

export const space = { xs: 4, s: 8, m: 12, l: 20, xl: 32 } as const;
export const radii = { card: 14, hero: 20, pill: 999 } as const;
export const font = {
  display: 'SpaceGrotesk-Bold',
  displayMedium: 'SpaceGrotesk-Medium',
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
} as const;

export function useTheme(): Palette {
  return palettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return 'now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
