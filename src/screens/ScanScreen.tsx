import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Body, Display, Empty, PillButton } from '../components/ui';
import { parseQr } from '../services/api';
import { useApp } from '../store';
import { radii, space, useTheme } from '../theme';

type Status = { kind: 'idle' } | { kind: 'linking' } | { kind: 'error'; message: string };
const FINDER = 240;

export default function ScanScreen({ onClose }: { onClose: () => void }) {
  const t = useTheme();
  const { link } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  if (!permission) return <View style={{ flex: 1, backgroundColor: t.paper }} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.paper, justifyContent: 'center' }}>
        <Empty title="Camera access needed" message="Adder only uses the camera to read the QR code from your adder instance.">
          <PillButton
            title={permission.canAskAgain ? 'Allow camera' : 'Open Settings'}
            tone="copper"
            onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
            style={{ alignSelf: 'stretch', marginTop: space.m }}
          />
          <PillButton title="Not now" tone="ghost" onPress={onClose} style={{ alignSelf: 'stretch' }} />
        </Empty>
      </SafeAreaView>
    );
  }

  async function onScanned({ data }: { data: string }) {
    if (status.kind === 'linking') return;
    const url = parseQr(data);
    if (!url) {
      setStatus({ kind: 'error', message: "That code isn't from adder. It should contain an apiEndpoint." });
      return;
    }
    setStatus({ kind: 'linking' });
    if (await link(url)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStatus({ kind: 'error', message: `Couldn't reach ${url}. Check the instance is up and try again.` });
    }
  }

  const scanning = status.kind === 'idle';

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanning ? onScanned : undefined}
      />

      <SafeAreaView edges={['top']} style={s.top}>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Display size={22} color="#fff">✕</Display>
        </Pressable>
        <Display size={17} weight="medium" color="#fff">Scan QR code</Display>
        <View style={{ width: 22 }} />
      </SafeAreaView>

      <View style={s.finderWrap} pointerEvents="none">
        <View style={{ width: FINDER, height: FINDER }}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => <Corner key={c} at={c} color={t.copper} />)}
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={[s.sheet, { backgroundColor: t.paper }]}>
        {status.kind === 'error' ? (
          <>
            <Display size={20}>Couldn't link.</Display>
            <Body color={t.inkSecondary}>{status.message}</Body>
            <PillButton title="Try again" tone="ink" onPress={() => setStatus({ kind: 'idle' })} />
          </>
        ) : (
          <>
            <Display size={20}>{status.kind === 'linking' ? 'Linking…' : 'Point at the code'}</Display>
            <Body color={t.inkSecondary}>
              {status.kind === 'linking'
                ? 'Sending this phone’s push token to your adder instance.'
                : 'Your adder instance shows a QR code with its endpoint. Line it up in the frame.'}
            </Body>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function Corner({ at, color }: { at: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const w = 3, len = 28;
  return (
    <View
      style={{
        position: 'absolute', width: len, height: len, borderColor: color,
        top: at[0] === 't' ? 0 : undefined, bottom: at[0] === 'b' ? 0 : undefined,
        left: at[1] === 'l' ? 0 : undefined, right: at[1] === 'r' ? 0 : undefined,
        borderTopWidth: at[0] === 't' ? w : 0, borderBottomWidth: at[0] === 'b' ? w : 0,
        borderLeftWidth: at[1] === 'l' ? w : 0, borderRightWidth: at[1] === 'r' ? w : 0,
      }}
    />
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.l, paddingVertical: space.m },
  finderWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: radii.hero, borderTopRightRadius: radii.hero,
    paddingHorizontal: space.l, paddingTop: space.l, paddingBottom: space.m, gap: space.m,
  },
});
