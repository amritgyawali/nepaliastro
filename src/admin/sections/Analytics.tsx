import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { APP_SCREENS } from '@/config/screens';
import { useAppConfig } from '@/config/store';
import { analyticsCsv, resetAnalytics, series, topScreens } from '@/lib/analytics';

import { useAdmin } from '../auth/store';
import { ago, dateTime, saveText, dayOfMonth, shortDay, useAnalytics } from '../format';
import { BarChart, RankList } from '../ui/charts';
import { Segmented } from '../ui/fields';
import { Button, EmptyState, Grid, Notice, Panel, Row, Stat } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { A, S, T } from '../ui/theme';

export default function Analytics() {
  const state = useAnalytics();
  const { draft } = useAppConfig();
  const { log } = useAdmin();
  const { confirm, toast } = useOverlay();
  const [days, setDays] = useState<'7' | '14' | '30' | '90'>('14');
  const n = Number(days);

  const points = useMemo(() => series(n), [state, n]); // eslint-disable-line react-hooks/exhaustive-deps
  const ranking = useMemo(() => topScreens(n), [state, n]); // eslint-disable-line react-hooks/exhaustive-deps
  const views = points.reduce((sum, p) => sum + p.stats.views, 0);
  const sessions = points.reduce((sum, p) => sum + p.stats.sessions, 0);
  const activeDays = points.filter((p) => p.stats.views > 0).length;

  const services = useMemo(() => {
    const byHref = new Map(ranking.map((r) => [r.key, r.count]));
    return draft.services.items
      .map((s) => ({ label: s.name, value: byHref.get(s.href.replace('/(tabs)', '')) ?? 0 }))
      .sort((a, b) => b.value - a.value);
  }, [draft.services.items, ranking]);

  const everyScreen = APP_SCREENS.filter((s) => s.group !== 'Onboarding').map((s) => ({
    label: s.label,
    value: ranking.find((r) => r.key === s.key)?.count ?? 0,
  })).sort((a, b) => b.value - a.value);

  return (
    <AdminPage
      section="analytics"
      description={`Counted on this device since ${dateTime(state.firstSeen)}. Nothing is sent anywhere, and nothing says who used the app.`}
      actions={
        <Segmented
          value={days}
          onChange={setDays}
          alwaysEditable
          options={[
            { value: '7', label: '7 days' },
            { value: '14', label: '14' },
            { value: '30', label: '30' },
            { value: '90', label: '90' },
          ]}
        />
      }
    >
      <View style={styles.stats}>
        <Stat label="Screen views" value={views.toLocaleString()} icon="eye" tone="brand" hint={`Last ${n} days`} />
        <Stat label="App starts" value={sessions.toLocaleString()} icon="play" tone="info" hint={`Last ${n} days`} />
        <Stat label="Days used" value={`${activeDays}/${n}`} icon="calendar" hint="Days with at least one view" />
        <Stat label="Views per start" value={sessions ? (views / sessions).toFixed(1) : '—'} icon="layers" hint="How far people go each time" />
      </View>

      <Grid min={420} max={2}>
        <Panel id="views" title="Screen views" description={`Per day, last ${n} days`} icon="chart">
          <BarChart data={points.map((p) => ({ label: dayOfMonth(p.key), value: p.stats.views, detail: shortDay(p.key) }))} />
        </Panel>

        <Panel id="sessions" title="App starts" description="Opened, or brought back after a while away" icon="play">
          <BarChart data={points.map((p) => ({ label: dayOfMonth(p.key), value: p.stats.sessions, detail: shortDay(p.key) }))} />
        </Panel>

        <Panel id="screen-table" title="Every screen, ranked" description={`Views over the last ${n} days`} icon="layers">
          <RankList data={everyScreen} limit={40} />
        </Panel>

        <Panel id="service-popularity" title="Services by use" description="The twenty services, by how often each was opened" icon="sparkle">
          <RankList data={services} limit={20} empty="No service opened yet." />
        </Panel>

        <Panel id="events" title="Recent activity on this device" description="The last screens opened and app starts, newest first" icon="pulse">
          {state.recent.slice(0, 25).map((hit, index) => (
            <View key={`${hit.at}-${index}`} style={styles.event}>
              <Text style={styles.eventKind}>{hit.kind === 'session' ? 'Start' : hit.kind === 'event' ? 'Event' : 'Screen'}</Text>
              <Text style={styles.eventName} numberOfLines={1}>
                {hit.name}
              </Text>
              <Text style={styles.eventTime}>{ago(hit.at)}</Text>
            </View>
          ))}
          {!state.recent.length ? <EmptyState icon="pulse" title="Nothing yet" body="Use the app for a moment and come back." /> : null}
        </Panel>

        <Panel id="analytics-export" title="Export or reset" description="Every day and screen as a spreadsheet file, or wipe the counts and start again" icon="download">
          <Row gap={S.sm} wrap>
            <Button
              label="Export CSV"
              icon="download"
              onPress={async () => {
                const result = await saveText(`astronepali-usage-${new Date().toISOString().slice(0, 10)}.csv`, analyticsCsv(), 'text/csv');
                toast(result === 'failed' ? 'The file could not be saved' : 'Usage exported', result === 'failed' ? 'danger' : 'success');
              }}
            />
            <Button
              label="Reset the counts"
              variant="danger"
              onPress={async () => {
                const ok = await confirm({ title: 'Reset usage counts on this device?', body: 'Every view and start counted so far is wiped. This cannot be undone.', confirmLabel: 'Reset counts', destructive: true });
                if (!ok) return;
                resetAnalytics();
                log('Reset analytics', 'analytics', '');
                toast('Counts reset');
              }}
            />
          </Row>
          <Notice tone="info">Counts cover this one device. For totals across every phone, connect an analytics service in a future build.</Notice>
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md },
  event: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: A.line },
  eventKind: { ...T.eyebrow, fontSize: 10.5, color: A.saffronInk, width: 52 },
  eventName: { ...T.mono, color: A.body, flex: 1 },
  eventTime: { ...T.small, color: A.subtle },
});
