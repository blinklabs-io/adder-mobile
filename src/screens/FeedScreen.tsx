import { FlatList, View } from 'react-native';
import { Body, Display, Empty, Eyebrow, Mono, PillButton, Rule, SectionHeader, TipMark } from '../components/ui';
import { AdderEvent, hostOf, useApp } from '../store';
import { space, timeAgo, useTheme } from '../theme';

export default function FeedScreen({ onScan }: { onScan: () => void }) {
  const t = useTheme();
  const { endpoint, events } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.l, paddingVertical: space.m }}>
        <TipMark />
        <Display size={22}>Adder</Display>
      </View>

      <FlatList
        data={endpoint ? events : []}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <EventRow e={item} />}
        ItemSeparatorComponent={() => <Rule inset={space.l} />}
        ListHeaderComponent={
          <>
            {endpoint ? <LinkedBand host={hostOf(endpoint)} count={events.length} /> : <UnlinkedBand onScan={onScan} />}
            {endpoint ? <SectionHeader label="Events" meta={events.length ? `${events.length} this session` : undefined} /> : null}
          </>
        }
        ListEmptyComponent={
          endpoint ? <Empty title="Nothing yet." message="Events show up here as your adder emits them. Leave the app in the background — you'll get a notification." /> : null
        }
        contentContainerStyle={{ paddingBottom: space.xl }}
      />
    </View>
  );
}

/** The hero: full-bleed inverted band. One per screen. */
function LinkedBand({ host, count }: { host: string; count: number }) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.ink, paddingHorizontal: space.l, paddingVertical: space.l, marginTop: space.s }}>
      <Eyebrow color={t.onInkMuted}>Linked to</Eyebrow>
      <Mono size={15} color={t.onInk} style={{ marginTop: space.xs }} numberOfLines={1}>{host}</Mono>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: space.l }}>
        <View>
          <Display size={72} color={t.onInk} style={{ lineHeight: 72 }}>{count}</Display>
          <Body size={13} color={t.onInkMuted}>events this session</Body>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, paddingBottom: space.xs }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.signal }} />
          <Display size={13} weight="medium" color={t.onInkMuted}>Receiving</Display>
        </View>
      </View>
    </View>
  );
}

function UnlinkedBand({ onScan }: { onScan: () => void }) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.ink, paddingHorizontal: space.l, paddingVertical: space.xl, marginTop: space.s, gap: space.m }}>
      <Eyebrow color={t.onInkMuted}>Not linked</Eyebrow>
      <Display size={32} color={t.onInk}>This phone isn't listening yet.</Display>
      <Body color={t.onInkMuted}>Scan the QR code your adder instance shows to start receiving its chain events here.</Body>
      <PillButton title="Scan QR code" tone="copper" onPress={onScan} style={{ marginTop: space.s }} />
    </View>
  );
}

function EventRow({ e }: { e: AdderEvent }) {
  const t = useTheme();
  const meta = Object.entries(e.data).slice(0, 3).map(([k, v]) => `${k}=${v}`).join(' · ');
  return (
    <View style={{ paddingHorizontal: space.l, paddingVertical: space.m, gap: space.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.m }}>
        <Display size={17} weight="medium" style={{ flex: 1 }} numberOfLines={1}>{e.title}</Display>
        <Mono size={12}>{timeAgo(e.receivedAt)}</Mono>
      </View>
      {e.body ? <Body size={14} color={t.inkSecondary}>{e.body}</Body> : null}
      {meta ? <Mono size={12} numberOfLines={1}>{meta}</Mono> : null}
    </View>
  );
}
