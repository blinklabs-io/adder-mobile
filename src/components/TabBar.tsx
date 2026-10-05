import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Body, Icon } from "./ui";
import { space, useTheme } from "../theme";
export type Tab = "feed" | "settings";
export default function TabBar({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: t.card,
        borderTopWidth: 1,
        borderTopColor: t.rule,
        flexDirection: "row",
        paddingTop: space.s,
        paddingBottom: Math.max(insets.bottom, space.s),
      }}
    >
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
            style={{
              flex: 1,
              minHeight: 56,
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            <View
              style={{
                width: 64,
                height: 30,
                borderRadius: 15,
                backgroundColor:
                  active && Platform.OS === "android"
                    ? t.accentSoft
                    : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={key}
                size={22}
                color={active ? t.accent : t.inkSecondary}
              />
            </View>
            <Body
              size={12}
              color={active ? t.accent : t.inkSecondary}
              style={{ fontWeight: active ? "600" : "400" }}
            >
              {key === "feed" ? "Feed" : "Settings"}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}
