import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Display, Rule } from './ui';
import { space, useTheme } from '../theme';

export type Tab = 'feed' | 'settings';
const TABS: { key: Tab; label: string }[] = [
  { key: 'feed', label: 'Feed' },
  { key: 'settings', label: 'Settings' },
];

export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: t.paper }}>
      <Rule />
      <View style={{ flexDirection: 'row', paddingBottom: Math.max(insets.bottom, space.s) }}>
        {TABS.map(({ key, label }) => {
          const active = key === tab;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => { if (!active) { Haptics.selectionAsync(); onChange(key); } }}
              style={{ flex: 1, alignItems: 'center', paddingTop: space.m, gap: space.s }}
            >
              <Display size={14} weight="medium" color={active ? t.ink : t.inkSecondary}>{label}</Display>
              <View style={{ width: 20, height: 2, borderRadius: 1, backgroundColor: active ? t.copper : 'transparent' }} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
