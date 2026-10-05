import { useRef, useState } from "react";
import { Animated, FlatList, Pressable, View } from "react-native";
import {
  Body,
  Brand,
  Button,
  Display,
  Empty,
  Icon,
  Mono,
  SectionHeader,
} from "../components/ui";
import { AdderEvent, hostOf, useApp } from "../store";
import { radii, space, timeAgo, useReducedMotion, useTheme } from "../theme";

export default function FeedScreen({ onScan }: { onScan: () => void }) {
  const t = useTheme();
  const { endpoint, events } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: space.l,
          paddingVertical: space.m,
        }}
      >
        <Brand size={34} />
        <Display size={25}>Adder</Display>
      </View>
      <FlatList
        data={endpoint ? events : []}
        keyExtractor={(e) => e.id}
        renderItem={({ item, index }) => (
          <EventRow
            e={item}
            latest={index === 0}
            last={index === events.length - 1}
          />
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
        contentContainerStyle={{ paddingBottom: space.xl }}
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
        marginTop: space.s,
        padding: 18,
        backgroundColor: t.panel,
        borderRadius: radii.card,
        flexDirection: "row",
        alignItems: "center",
        gap: space.m,
      }}
    >
      <Icon name="link" color={t.accent} size={26} />
      <View style={{ flex: 1, gap: 5 }}>
        <Body size={13} color={t.inkSecondary}>
          Linked to
        </Body>
        <Mono size={14} color={t.ink} selectable>
          {host}
        </Mono>
      </View>
    </View>
  );
}
function Unlinked({ onScan }: { onScan: () => void }) {
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: space.l, paddingTop: 24 }}>
      <View
        style={{
          backgroundColor: t.panel,
          borderRadius: radii.card,
          padding: 24,
          marginBottom: 28,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View
            style={{
              width: 64,
              height: 76,
              borderWidth: 2,
              borderColor: t.accent,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="scan" size={34} color={t.accent} />
            <View
              style={{
                position: "absolute",
                bottom: 6,
                height: 3,
                width: 18,
                borderRadius: 2,
                backgroundColor: t.accent,
              }}
            />
          </View>
          <View style={{ flex: 1, gap: space.xs }}>
            <Display size={18}>Your Adder instance</Display>
            <Body size={17} color={t.inkSecondary}>
              One QR code links this phone.
            </Body>
          </View>
        </View>
      </View>
      <Display size={30} style={{ maxWidth: 300 }}>
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
    </View>
  );
}
function EventRow({
  e,
  latest,
  last,
}: {
  e: AdderEvent;
  latest: boolean;
  last: boolean;
}) {
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
    <View style={{ flexDirection: "row", paddingHorizontal: space.l }}>
      <View style={{ width: 24, marginRight: 10, alignItems: "center" }}>
        {!last ? (
          <View
            style={{
              position: "absolute",
              top: 20,
              bottom: -20,
              width: 1,
              backgroundColor: t.rule,
            }}
          />
        ) : null}
        <View
          style={{
            width: 11,
            height: 11,
            borderRadius: 6,
            marginTop: 22,
            backgroundColor: latest ? t.signal : t.paper,
            borderWidth: 2,
            borderColor: latest ? t.signal : t.inkSecondary,
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
          marginBottom: 12,
          borderRadius: radii.card,
          backgroundColor: t.card,
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
            padding: 16,
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
            }}
          >
            <Body size={12} color={t.inkSecondary}>
              {timeAgo(e.receivedAt)}
            </Body>
            {latest ? (
              <Body size={12} color={t.signal} style={{ fontWeight: "600" }}>
                Latest
              </Body>
            ) : null}
          </View>
          <Display size={18}>{e.title}</Display>
          {e.body ? (
            <Body size={17} color={t.inkSecondary}>
              {e.body}
            </Body>
          ) : null}
          {entries.length ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                marginTop: space.xs,
              }}
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
            style={{ opacity: fade, padding: 16, paddingTop: 0, gap: 12 }}
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
    </View>
  );
}
