import { useRef, useState } from "react";
import { Modal, View } from "react-native";
import { BlurTargetView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import TabBar, { Tab } from "./src/components/TabBar";
import FeedScreen from "./src/screens/FeedScreen";
import ScanScreen from "./src/screens/ScanScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { AppProvider } from "./src/store";
import { useReducedMotion, useTheme } from "./src/theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const blurTarget = useRef<View | null>(null);
  const [navHeight, setNavHeight] = useState(72);
  const bottomClearance = navHeight + Math.max(insets.bottom, 12) + 24;
  const reducedMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("feed");
  const [scanning, setScanning] = useState(false);
  const openScan = () => setScanning(true);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: t.paper }}>
      <StatusBar style="auto" />
      <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
        {tab === "feed" ? (
          <FeedScreen onScan={openScan} bottomClearance={bottomClearance} />
        ) : (
          <SettingsScreen onScan={openScan} bottomClearance={bottomClearance} />
        )}
      </BlurTargetView>
      <TabBar tab={tab} onChange={setTab} blurTarget={blurTarget} onHeightChange={setNavHeight} />
      <Modal
        visible={scanning}
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={() => setScanning(false)}
      >
        <SafeAreaProvider>
          <ScanScreen onClose={() => setScanning(false)} />
        </SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
}
