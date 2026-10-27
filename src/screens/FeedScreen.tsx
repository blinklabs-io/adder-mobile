import { useRef, useState } from "react";
import { Animated, FlatList, Pressable, View } from "react-native";
import {
  Body,
  Button,
  Display,
  Empty,
  Icon,
  Mono,
  SectionHeader,
} from "../components/ui";
import { AdderEvent, hostOf, useApp } from "../store";
import { radii, space, timeAgo, useReducedMotion, useTheme } from "../theme";

export default function FeedScreen({ onScan, bottomClearance }: { onScan: () => void; bottomClearance: number }) {
  const t = useTheme();
  const { endpoint, events } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: t.paper,
          paddingHorizontal: space.l,
          paddingVertical: space.s,
        }}
      >
        <Display size={28}>Adder</Display>
        <Pressable
          onPress={onScan}
          accessibilityRole="button"
          accessibilityLabel="Scan QR code"
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: t.panel,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="scan" size={22} color={t.accent} />
        </Pressable>
      </View>
      <FlatList
        data={endpoint ? events : []}
        keyExtractor={(e) => e.id}
        renderItem={({ item, index }) => (
          <EventRow e={item} latest={index === 0} />
        )}
        ListHeaderComponent={
          <>
            {endpoint ? (
              <LinkedInstance host={hostOf(endpoint)} />
            ) : (
              <Unlinked onScan={onScan} />
            )}
            {endpoint ? (
              <SectionHeader
                label="Events"
                meta={`${events.length} this session`}
              />
            ) : null}
          </>
        }
        ListEmptyComponent={
          endpoint ? (
            <Empty
              title="Nothing yet."
              message="Events show up here as your adder emits them. Leave the app in the background — you'll get a notification."
            />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: bottomClearance }}
      />
    </View>
  );
}
function LinkedInstance({ host }: { host: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        marginHorizontal: space.l,
        marginTop: space.l,
        padding: 20,
        backgroundColor: t.accent,
        borderRadius: radii.card,
        flexDirection: "row",
        alignItems: "center",
        gap: space.m,
      }}
    >
      <Icon name="link" color={t.onAccent} size={24} />
      <View style={{ flex: 1, gap: 4 }}>
        <Body size={13} color={t.onAccent}>
          Linked to
        </Body>
        <Mono size={14} color={t.onAccent} selectable>
          {host}
        </Mono>
      </View>
    </View>
  );
}
function Unlinked({ onScan }: { onScan: () => void }) {
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: space.l, paddingTop: 40 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: t.accentSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="scan" size={32} color={t.accent} />
      </View>
      <Display size={24} style={{ marginTop: space.l }}>
        This phone isn't listening yet.
      </Display>
      <Body size={17} color={t.inkSecondary} style={{ marginTop: space.m }}>
        Scan the QR code your adder instance shows to start receiving its chain
        events here.
      </Body>
      <Button
        title="Scan QR code"
        icon="scan"
        onPress={onScan}
        style={{ marginTop: 24 }}
      />
      <View
        style={{
          marginTop: space.xl,
          gap: space.s,
          padding: 20,
          borderRadius: radii.card,
          backgroundColor: t.card,
        }}
      >
        <Body size={15} style={{ fontWeight: "600" }}>
          Your Adder instance
        </Body>
        <Body size={15} color={t.inkSecondary}>
          One QR code links this phone.
        </Body>
      </View>
    </View>
  );
}
function EventRow({ e, latest }: { e: AdderEvent; latest: boolean }) {
  const t = useTheme();
  const [expanded, setExpanded] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();
  const entries = Object.entries(e.data);
  function toggle() {
    if (!expanded && !reducedMotion) {
      fade.setValue(0.4);
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
    setExpanded(!expanded);
  }
  return (
    <View
      style={{
        backgroundColor: t.card,
        borderRadius: radii.card,
        marginHorizontal: space.l,
        marginBottom: space.m,
        overflow: "hidden",
      }}
    >
        <Pressable
          onPress={entries.length ? toggle : undefined}
          disabled={!entries.length}
          accessibilityRole={entries.length ? "button" : undefined}
          accessibilityState={entries.length ? { expanded } : undefined}
          accessibilityLabel={`${e.title}, ${timeAgo(e.receivedAt)}${e.body ? `. ${e.body}` : ""}`}
          accessibilityHint={
            entries.length ? "Show or hide event data" : undefined
          }
          style={({ pressed }) => ({
            paddingHorizontal: space.l,
            paddingVertical: 18,
            gap: space.s,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: space.s,
              flexWrap: "wrap",
            }}
          >
            <Display
              size={18}
              weight="medium"
              style={{ flexGrow: 1, flexShrink: 1 }}
            >
              {e.title}
            </Display>
            <Body size={12} color={t.inkSecondary}>
              {timeAgo(e.receivedAt)}
            </Body>
          </View>
          {latest ? (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: t.signalSoft,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Body size={12} color={t.signal} style={{ fontWeight: "600" }}>
                Latest
              </Body>
            </View>
          ) : null}
          {e.body ? (
            <Body size={17} color={t.inkSecondary}>
              {e.body}
            </Body>
          ) : null}
          {entries.length ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Body size={13} color={t.accent} style={{ fontWeight: "600" }}>
                {expanded ? "Hide event data" : "View event data"}
              </Body>
              <View
                style={{
                  transform: [{ rotate: expanded ? "-90deg" : "90deg" }],
                }}
              >
                <Icon name="chevron" size={16} color={t.accent} />
              </View>
            </View>
          ) : null}
        </Pressable>
        {expanded ? (
          <Animated.View
            style={{
              opacity: fade,
              paddingHorizontal: space.l,
              paddingBottom: 18,
              gap: 12,
            }}
          >
            {entries.map(([key, value]) => (
              <View key={key} style={{ gap: 4 }}>
                <Body size={12} color={t.inkSecondary}>
                  {key}
                </Body>
                <Mono size={13} color={t.ink} selectable>
                  {value}
                </Mono>
              </View>
            ))}
          </Animated.View>
        ) : null}
    </View>
  );
}
