import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from 'react-native';

import { APP_SCREENS } from '@/config/screens';
import { useAppConfig } from '@/config/store';
import { dayKey, series, topScreens } from '@/lib/analytics';

import { useAdmin } from '../auth/store';
import { areaLabel } from '../editor';
import { ago, greeting, dayOfMonth, shortDay, useAnalytics, useNow } from '../format';
import { checkConfig } from '../health';
import { HOUSE_AREAS, SECTIONS } from '../nav';
import { BarChart, RankList, Sparkline } from '../ui/charts';
import { useContentWidth } from '../ui/context';
import { AIcon, type AdminIconName } from '../ui/icons';
import { Badge, Button, EmptyState, Grid, ListRow, Panel, Row, Stat } from '../ui/kit';
import { KundliMark } from '../ui/Kundli';
import { AdminPage } from '../ui/Page';
import { Avatar, go } from '../ui/Shell';
import { A, R, S, T, TONES } from '../ui/theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

function screenLabel(key: string): string {
  return APP_SCREENS.find((screen) => screen.key === key)?.label ?? key;
}

export default function Overview() {
  const router = useRouter();
  const now = useNow();
  const { me, users, audit, can } = useAdmin();
  const { draft, live, dirty, publish } = useAppConfig();
  const analytics = useAnalytics();
  const width = useContentWidth();

  const days = useMemo(() => series(14), [analytics]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = analytics.days[dayKey()] ?? { views: 0, sessions: 0, screens: {}, events: {} };
  const top = useMemo(() => topScreens(7), [analytics]); // eslint-disable-line react-hooks/exhaustive-deps
  const findings = useMemo(() => checkConfig(draft, now), [draft, now]);
  const activeTeam = users.filter((u) => u.status === 'active').length;

  const actions: { label: string; icon: AdminIconName; href: string; show: boolean }[] = [
    { label: 'Change the brand colour', icon: 'palette', href: '/admin/theme?tool=brand-color', show: can('design.view') },
    { label: 'Replace the logo', icon: 'flag', href: '/admin/branding?tool=logo', show: can('branding.view') },
    { label: 'Add an astrologer', icon: 'moon', href: '/admin/astrologers?tool=roster', show: can('catalog.view') },
    { label: 'Post a home banner', icon: 'megaphone', href: '/admin/engagement?tool=banners', show: can('engagement.view') },
    { label: 'Build a new page', icon: 'page', href: '/admin/screens?tool=pages', show: can('screens.view') },
    { label: 'Rearrange the home screen', icon: 'home', href: '/admin/navigation?tool=home-order', show: can('navigation.view') },
    { label: 'Turn a screen off', icon: 'toggle', href: '/admin/screens?tool=screen-switches', show: can('screens.view') },
    { label: 'Add a team member', icon: 'users', href: '/admin/team?tool=invite', show: can('team.manage') },
  ];

  const first = me?.name.split(/\s+/)[0] ?? '';

  return (
    <AdminPage
      section="overview"
      title={`${greeting(new Date(now))}${first ? `, ${first}` : ''}`}
      description={`Revision ${live.meta.revision} is live${live.meta.publishedAt ? `, published ${ago(live.meta.publishedAt, now)} by ${live.meta.publishedBy}` : ' — the app as it shipped'}.`}
      actions={
        can('publish.run') && dirty.length ? (
          <Button label="Review and publish" icon="send" variant="primary" onPress={() => go(router, '/admin/publish')} />
        ) : undefined
      }
    >
      <Panel id="kpis" padded={false} subtle style={styles.kpiPanel}>
        <View style={styles.kpis}>
          <Stat label="Screen views today" value={today.views} icon="eye" tone="brand" hint="On this device">
            <Sparkline values={days.map((d) => d.stats.views)} width={Math.min(160, width / 5)} />
          </Stat>
          <Stat label="App starts today" value={today.sessions} icon="play" tone="info" hint="Opened or brought back" />
          <Stat
            label="Waiting to publish"
            value={dirty.length}
            icon="send"
            tone={dirty.length ? 'warning' : 'success'}
            hint={dirty.length ? dirty.map(areaLabel).slice(0, 3).join(', ') : 'Everything is live'}
            onPress={() => go(router, '/admin/publish')}
          />
          <Stat
            label="Team"
            value={activeTeam}
            icon="users"
            hint={`${users.length - activeTeam} suspended`}
            onPress={can('team.view') ? () => go(router, '/admin/team') : undefined}
          />
        </View>
      </Panel>

      <Grid min={380} max={2}>
        <Panel id="traffic" title="Screen views, last 14 days" description="Every screen opened in the app on this device" icon="chart">
          <BarChart
            data={days.map((d) => ({
              label: dayOfMonth(d.key),
              value: d.stats.views,
              detail: shortDay(d.key),
            }))}
          />
        </Panel>

        <Panel
          id="pending"
          title="Waiting to go live"
          description="A house of the chart lights up for each part of the app with unpublished changes"
          icon="kundli"
          actions={dirty.length ? <Button label="Review" size="sm" onPress={() => go(router, '/admin/publish?tool=review')} /> : undefined}
        >
          <View style={styles.pending}>
            <KundliMark size={128} dirty={dirty} line={A.lineStrong} lit={A.saffron} />
            <View style={styles.pendingList}>
              {HOUSE_AREAS.map((house) => {
                const on = house.areas.some((area) => dirty.includes(area));
                return (
                  <View key={house.label} style={styles.pendingRow}>
                    <View style={[styles.pendingDot, on && styles.pendingDotOn]} />
                    <Text style={[styles.pendingLabel, on && styles.pendingLabelOn]} numberOfLines={1}>
                      {house.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
          {dirty.length && can('publish.run') ? (
            <Button
              label={`Publish ${dirty.length} change${dirty.length === 1 ? '' : 's'} now`}
              variant="primary"
              icon="send"
              onPress={() => {
                publish('Published from the overview', me?.name ?? '');
              }}
            />
          ) : null}
        </Panel>

        <Panel id="top-screens" title="Most opened screens" description="The last seven days" icon="layers">
          <RankList data={top.map((row) => ({ label: screenLabel(row.key), value: row.count }))} empty="Nothing opened yet this week." />
        </Panel>

        <Panel
          id="health"
          title="Health checks"
          description="Things in the draft worth a look before it goes live"
          icon="pulse"
          actions={<Badge label={findings.length ? `${findings.length} found` : 'All clear'} tone={findings.length ? 'warning' : 'success'} />}
        >
          {findings.length ? (
            findings.map((finding) => (
              <Pressable
                key={finding.id}
                accessibilityRole="button"
                onPress={() => go(router, finding.href)}
                style={(state) => [styles.finding, (state as Interaction).hovered && styles.findingHover]}
              >
                <View style={[styles.findingBar, { backgroundColor: TONES[finding.tone].fg }]} />
                <View style={styles.findingText}>
                  <Text style={styles.findingTitle}>{finding.title}</Text>
                  <Text style={styles.findingDetail} numberOfLines={2}>
                    {finding.detail}
                  </Text>
                </View>
                <AIcon name="right" size={16} color={A.subtle} />
              </Pressable>
            ))
          ) : (
            <EmptyState icon="check" title="Nothing to fix" body="Contrast, text, lists and switches all look right." />
          )}
        </Panel>

        <Panel
          id="activity"
          title="Recent team activity"
          icon="history"
          actions={can('audit.view') ? <Button label="All activity" size="sm" variant="ghost" onPress={() => go(router, '/admin/audit')} /> : undefined}
        >
          {audit.slice(0, 7).map((entry) => {
            const user = users.find((u) => u.id === entry.userId);
            return (
              <ListRow
                key={entry.id}
                leading={<Avatar name={entry.userName} color={user?.color ?? A.subtle} size={30} />}
                title={`${entry.userName} · ${entry.action}`}
                subtitle={`${entry.detail ? `${entry.detail} · ` : ''}${ago(entry.at, now)}`}
              />
            );
          })}
          {!audit.length ? <EmptyState icon="history" title="No activity yet" /> : null}
        </Panel>

        <Panel id="shortcuts" title="Quick actions" icon="bolt">
          <View style={styles.actions}>
            {actions
              .filter((action) => action.show)
              .map((action) => (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  onPress={() => go(router, action.href)}
                  style={(state) => [styles.action, ((state as Interaction).hovered || state.pressed) && styles.actionHover]}
                >
                  <AIcon name={action.icon} size={18} color={A.saffronInk} />
                  <Text style={styles.actionLabel} numberOfLines={2}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
          </View>
          <Row gap={S.sm} wrap>
            <Text style={styles.moreTools}>{SECTIONS.length - 2} sections, 130+ tools.</Text>
            <Button label="See every tool" size="sm" variant="ghost" icon="tools" onPress={() => go(router, '/admin/tools')} />
          </Row>
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  kpiPanel: { borderWidth: 0, backgroundColor: 'transparent' },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md },
  pending: { flexDirection: 'row', alignItems: 'center', gap: S.xl, flexWrap: 'wrap' },
  pendingList: { flex: 1, minWidth: 180, flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 },
  pendingRow: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: S.sm },
  pendingDot: { width: 8, height: 8, borderRadius: 2, borderWidth: 1, borderColor: A.lineStrong, transform: [{ rotate: '45deg' }] },
  pendingDotOn: { backgroundColor: A.saffron, borderColor: A.saffron },
  pendingLabel: { ...T.small, color: A.subtle, flexShrink: 1 },
  pendingLabelOn: { color: A.ink, fontFamily: T.label.fontFamily },
  finding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.sm,
    paddingRight: S.sm,
    borderRadius: R.md,
  },
  findingHover: { backgroundColor: A.hover },
  findingBar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  findingText: { flex: 1 },
  findingTitle: { ...T.label, color: A.ink },
  findingDetail: { ...T.small, color: A.muted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  action: {
    flexGrow: 1,
    flexBasis: 150,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    padding: S.md,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: A.line,
  },
  actionHover: { backgroundColor: A.saffronSoft, borderColor: A.saffron },
  actionLabel: { ...T.label, color: A.ink, flex: 1 },
  moreTools: { ...T.small, color: A.muted },
});
