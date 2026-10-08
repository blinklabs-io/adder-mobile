import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import app from "../../app.json";
import {
  Body,
  Display,
  Icon,
  Mono,
  SectionHeader,
} from "../components/ui";
import { AuthorizationStatus } from "../services/notifications";
import { useApp } from "../store";
import { radii, space, useTheme } from "../theme";
const PERMISSION_LABEL: Record<number, string> = {
  [AuthorizationStatus.AUTHORIZED]: "Allowed",
  [AuthorizationStatus.PROVISIONAL]: "Quiet",
  [AuthorizationStatus.DENIED]: "Off",
  [AuthorizationStatus.NOT_DETERMINED]: "Not asked",
};
export default function SettingsScreen({ onScan, bottomClearance }: { onScan: () => void; bottomClearance: number }) {
  const t = useTheme();
  const { endpoint, token, permission, unlink } = useApp();
  const [copied, setCopied] = useState(false);
  async function copyToken() {
    if (!token) return;
    await Clipboard.setStringAsync(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.paper }}
      contentContainerStyle={{ paddingBottom: bottomClearance }}
    >
      <Display
        size={28}
        style={{ paddingHorizontal: space.l, paddingTop: space.l }}
      >
        Settings
      </Display>
      <SectionHeader label="Adder instance" />
      <View
        style={{
          marginHorizontal: space.l,
          backgroundColor: t.card,
          borderRadius: radii.card,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: space.m,
            padding: 18,
          }}
        >
          <Icon name="link" size={20} color={t.inkSecondary} />
          <View style={{ flex: 1, gap: 5 }}>
            <Body size={13} color={t.inkSecondary}>
              Endpoint
            </Body>
            <Mono color={t.ink} selectable>
              {endpoint ?? "Not linked"}
            </Mono>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onScan}
          style={({ pressed }) => ({
            minHeight: 56,
            paddingHorizontal: 18,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: space.m,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Icon name="scan" size={20} color={t.accent} />
          <Body color={t.accent} style={{ flex: 1 }}>
            {endpoint ? "Scan a new QR code" : "Scan QR code"}
          </Body>
          <Icon name="chevron" size={16} color={t.inkSecondary} />
        </Pressable>
        {endpoint ? (
          <Pressable
            accessibilityRole="button"
            onPress={unlink}
            style={({ pressed }) => ({
              minHeight: 48,
              paddingHorizontal: 18,
              paddingVertical: 14,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Body color={t.alarm}>Unlink this phone</Body>
          </Pressable>
        ) : null}
      </View>
      <SectionHeader label="This phone" />
      <View
        style={{
          marginHorizontal: space.l,
          backgroundColor: t.card,
          borderRadius: radii.card,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            padding: 18,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: space.s,
            alignItems: "center",
          }}
        >
          <Body style={{ flexGrow: 1 }}>Notifications</Body>
          <Body color={t.inkSecondary}>
            {permission == null
              ? "Checking…"
              : (PERMISSION_LABEL[permission] ?? "Unknown")}
          </Body>
        </View>
        <View style={{ padding: 18, gap: space.s }}>
          <Body>Push token</Body>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: space.s }}
          >
            <Mono style={{ flex: 1 }}>
              {token
                ? `${token.slice(0, 10)}…${token.slice(-6)}`
                : "Unavailable"}
            </Mono>
            {token ? (
              <Pressable
                onPress={copyToken}
                accessibilityRole="button"
                accessibilityLabel={copied ? "Token copied" : "Copy push token"}
                style={({ pressed }) => ({
                  minHeight: 48,
                  minWidth: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.65 : 1,
                })}
              >
                <Body color={t.accent} style={{ fontWeight: "600" }}>
                  {copied ? "Copied" : "Copy"}
                </Body>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
      <View
        style={{
          marginHorizontal: space.l,
          marginTop: space.xl,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View>
          <Body size={14} style={{ fontWeight: "600" }}>
            Adder
          </Body>
          <Body size={12} color={t.inkSecondary}>
            Version {app.expo.version}
          </Body>
        </View>
      </View>
    </ScrollView>
  );
}
