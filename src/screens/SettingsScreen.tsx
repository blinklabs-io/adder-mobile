import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import app from '../../app.json';
import { Body, Display, Mono, PillButton, Rule, SectionHeader } from '../components/ui';
import { AuthorizationStatus } from '../services/notifications';
import { hostOf, useApp } from '../store';
import { space, useTheme } from '../theme';

const PERMISSION_LABEL: Record<number, string> = {
  [AuthorizationStatus.AUTHORIZED]: 'Allowed',
  [AuthorizationStatus.PROVISIONAL]: 'Quiet',
  [AuthorizationStatus.DENIED]: 'Off',
  [AuthorizationStatus.NOT_DETERMINED]: 'Not asked',
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
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: space.xl }}>
      <Display size={32} style={{ paddingHorizontal: space.l, paddingTop: space.l }}>Settings</Display>

      <SectionHeader label="Adder instance" />
      <Row label="Endpoint" value={endpoint ? hostOf(endpoint) : '—'} mono />
      <View style={{ paddingHorizontal: space.l, gap: space.s, marginTop: space.m }}>
        <PillButton title={endpoint ? 'Scan a new QR code' : 'Scan QR code'} tone={endpoint ? 'ink' : 'copper'} onPress={onScan} />
        {endpoint ? <PillButton title="Unlink this phone" tone="alarm" onPress={unlink} /> : null}
      </View>

      <SectionHeader label="This phone" />
      <Row label="Notifications" value={permission == null ? '…' : PERMISSION_LABEL[permission] ?? 'Unknown'} />
      <Rule inset={space.l} />
      <Row
        label="Push token"
        value={token ? `${token.slice(0, 10)}…${token.slice(-6)}` : '—'}
        mono
        action={token ? { label: copied ? 'Copied' : 'Copy', onPress: copyToken } : undefined}
      />

      <SectionHeader label="About" />
      <Row label="Version" value={app.expo.version} mono />
    </ScrollView>
  );
}

function Row({ label, value, mono, action }: {
  label: string; value: string; mono?: boolean; action?: { label: string; onPress: () => void };
}) {
  const t = useTheme();
  const Value = mono ? Mono : Body;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.l, paddingVertical: space.m, gap: space.m }}>
      <Body color={t.inkSecondary} style={{ width: 112 }}>{label}</Body>
      <Value size={14} color={t.ink} style={{ flex: 1, textAlign: 'right' }} numberOfLines={1}>{value}</Value>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button">
          <Display size={14} weight="medium" color={t.copper}>{action.label}</Display>
        </Pressable>
      ) : null}
    </View>
  );
}
