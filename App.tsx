import { useState } from "react";
import { Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
  const reducedMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("feed");
  const [scanning, setScanning] = useState(false);
  const openScan = () => setScanning(true);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: t.paper }}>
      <StatusBar style="auto" />
      {tab === "feed" ? (
        <FeedScreen onScan={openScan} />
      ) : (
        <SettingsScreen onScan={openScan} />
      )}
      <TabBar tab={tab} onChange={setTab} />
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
