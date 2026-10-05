import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import app from "../../app.json";
import {
  Body,
  Brand,
  Button,
  Display,
  Icon,
  Mono,
  Rule,
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
export default function SettingsScreen({ onScan }: { onScan: () => void }) {
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
      contentContainerStyle={{ paddingBottom: space.xl }}
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
          padding: 18,
          gap: 16,
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: space.m }}
        >
          <Icon name="link" color={t.accent} />
          <View style={{ flex: 1, gap: 5 }}>
            <Body size={13} color={t.inkSecondary}>
              Endpoint
            </Body>
            <Mono color={t.ink} selectable>
              {endpoint ?? "Not linked"}
            </Mono>
          </View>
        </View>
        <Button
          title={endpoint ? "Scan a new QR code" : "Scan QR code"}
          tone="secondary"
          icon="scan"
          onPress={onScan}
        />
      </View>
      {endpoint ? (
        <Pressable
          accessibilityRole="button"
          onPress={unlink}
          style={({ pressed }) => ({
            minHeight: 48,
            marginHorizontal: space.l,
            paddingHorizontal: 18,
            paddingVertical: 14,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Body color={t.alarm} style={{ fontWeight: "600" }}>
            Unlink this phone
          </Body>
        </Pressable>
      ) : null}
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
        <Rule inset={18} />
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
        <Brand size={30} />
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
