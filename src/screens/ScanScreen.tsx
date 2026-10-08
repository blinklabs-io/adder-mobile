import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Body, Button, Display, Empty, Icon } from "../components/ui";
import { parseQr } from "../services/api";
import { useApp } from "../store";
import { radii, space, useTheme } from "../theme";

type Status =
  | { kind: "idle" }
  | { kind: "linking" }
  | { kind: "error"; message: string };
export default function ScanScreen({ onClose }: { onClose: () => void }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { link } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  if (!permission)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: t.paper,
          justifyContent: "center",
          padding: space.xl,
        }}
      >
        <ActivityIndicator color={t.accent} />
        <Button
          title="Cancel"
          tone="secondary"
          onPress={onClose}
          style={{ marginTop: space.l }}
        />
      </SafeAreaView>
    );
  if (!permission.granted)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.paper }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <Empty
            title="Camera access needed"
            message="Adder only uses the camera to read the QR code from your adder instance."
          >
            <Button
              title={permission.canAskAgain ? "Allow camera" : "Open Settings"}
              icon="scan"
              onPress={() => {
                if (permission.canAskAgain) void requestPermission();
                else void Linking.openSettings();
              }}
              style={{ marginTop: space.m }}
            />
            <Button title="Not now" tone="secondary" onPress={onClose} />
          </Empty>
        </ScrollView>
      </SafeAreaView>
    );
  async function onScanned({ data }: { data: string }) {
    if (status.kind === "linking") return;
    const url = parseQr(data);
    if (!url) {
      setStatus({
        kind: "error",
        message:
          "That code isn't from adder. It should contain an apiEndpoint.",
      });
      return;
    }
    setStatus({ kind: "linking" });
    if (await link(url)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStatus({
        kind: "error",
        message: `Couldn't reach ${url}. Check the instance is up and try again.`,
      });
    }
  }
  const finder = Math.min(248, width - 96);
  return (
    <View style={{ flex: 1, backgroundColor: t.camera }}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={status.kind === "idle" ? onScanned : undefined}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(25,19,15,0.28)" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: space.l,
            paddingVertical: space.s,
            gap: space.m,
          }}
        >
          <Display size={20} color={t.cameraInk} style={{ flex: 1 }}>
            Scan QR code
          </Display>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
            style={({ pressed }) => ({
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: pressed ? "#544032" : "#35271E",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <Icon name="close" color={t.cameraInk} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            pointerEvents="none"
            style={{
              flex: 1,
              minHeight: finder + 80,
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
            }}
          >
            <View style={{ width: finder, height: finder }}>
              {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                <Corner
                  key={corner}
                  at={corner}
                  color={status.kind === "error" ? "#E4A091" : t.cameraInk}
                />
              ))}
            </View>
            <Body
              size={13}
              color={t.cameraMuted}
              style={{ paddingHorizontal: space.l, textAlign: "center" }}
            >
              Keep the QR code inside the frame
            </Body>
          </View>
          <View
            accessibilityLiveRegion="polite"
            style={{
              margin: space.l,
              padding: 22,
              gap: space.m,
              borderRadius: radii.card,
              backgroundColor: t.card,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.m,
              }}
            >
              {status.kind === "linking" ? (
                <ActivityIndicator color={t.accent} />
              ) : null}
              <Display size={20} style={{ flex: 1 }}>
                {status.kind === "error"
                  ? "Couldn't link."
                  : status.kind === "linking"
                    ? "Linking…"
                    : "Point at the code"}
              </Display>
            </View>
            <Body color={t.inkSecondary}>
              {status.kind === "error"
                ? status.message
                : status.kind === "linking"
                  ? "Sending this phone’s push token to your adder instance."
                  : "Your adder instance shows a QR code with its endpoint. Line it up in the frame."}
            </Body>
            {status.kind === "error" ? (
              <Button
                title="Try again"
                onPress={() => setStatus({ kind: "idle" })}
              />
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
function Corner({
  at,
  color,
}: {
  at: "tl" | "tr" | "bl" | "br";
  color: string;
}) {
  return (
    <View
      style={{
        position: "absolute",
        width: 32,
        height: 32,
        borderColor: color,
        top: at[0] === "t" ? 0 : undefined,
        bottom: at[0] === "b" ? 0 : undefined,
        left: at[1] === "l" ? 0 : undefined,
        right: at[1] === "r" ? 0 : undefined,
        borderTopWidth: at[0] === "t" ? 3 : 0,
        borderBottomWidth: at[0] === "b" ? 3 : 0,
        borderLeftWidth: at[1] === "l" ? 3 : 0,
        borderRightWidth: at[1] === "r" ? 3 : 0,
        borderTopLeftRadius: at === "tl" ? 12 : 0,
        borderTopRightRadius: at === "tr" ? 12 : 0,
        borderBottomLeftRadius: at === "bl" ? 12 : 0,
        borderBottomRightRadius: at === "br" ? 12 : 0,
      }}
    />
  );
}
