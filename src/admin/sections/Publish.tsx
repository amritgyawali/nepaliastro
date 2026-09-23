import { useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { diffConfigs } from '@/config/merge';
import { CONFIG_AREAS } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import { useAdmin } from '../auth/store';
import { areaLabel } from '../editor';
import { ago, dateTime } from '../format';
import { DateTimeField, TextField } from '../ui/fields';
import { Badge, Button, EmptyState, Grid, Notice, Panel, Row } from '../ui/kit';
import { KundliMark } from '../ui/Kundli';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { A, R, S, T } from '../ui/theme';

function show(value: unknown): string {
  if (value === undefined) return '—';
  if (typeof value === 'string') {
    if (value.startsWith('data:')) return '[uploaded picture]';
    return value.length > 80 ? `“${value.slice(0, 77)}…”` : `“${value}”`;
  }
  const text = JSON.stringify(value);
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

export default function Publish() {
  const router = useRouter();
  const { live, draft, dirty, history, previewing, scheduled, publish, discardDraft, rollback, startPreview, stopPreview, schedulePublish, setReturnTo } = useAppConfig();
  const { me, can, log } = useAdmin();
  const { confirm, toast } = useOverlay();
  const [note, setNote] = useState('');
  const [when, setWhen] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const changes = useMemo(() => diffConfigs(live, draft), [live, draft]);
  const canPublish = can('publish.run');
  const shown = showAll ? changes : changes.slice(0, 40);

  const doPublish = async () => {
    const ok = await confirm({
      title: `Publish ${changes.length} change${changes.length === 1 ? '' : 's'}?`,
      body: 'The app on this device shows them straight away. Other phones get them when they next sync with your server.',
      confirmLabel: 'Publish',
    });
    if (!ok) return;
    setReturnTo('/admin/publish');
    const next = publish(note || `${dirty.map(areaLabel).join(', ')}`, me?.name ?? '');
    log('Published', 'publish', `Revision ${next.meta.revision}: ${note || dirty.map(areaLabel).join(', ')}`);
    setNote('');
    toast(`Published revision ${next.meta.revision}`);
  };

  return (
    <AdminPage section="publish">
      <View style={styles.hero}>
        <KundliMark size={88} dirty={dirty} line={A.lineStrong} />
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{dirty.length ? `${changes.length} change${changes.length === 1 ? '' : 's'} in ${dirty.length} part${dirty.length === 1 ? '' : 's'} of the app` : 'The draft matches what is live'}</Text>
          <Text style={styles.heroBody}>
            Revision {live.meta.revision} is live{live.meta.publishedAt ? `, published ${ago(live.meta.publishedAt)} by ${live.meta.publishedBy}` : ''}.
          </Text>
          <Row gap={6} wrap>
            {dirty.map((area) => (
              <Badge key={area} label={areaLabel(area)} tone="brand" />
            ))}
          </Row>
        </View>
      </View>

      <Grid min={400} max={2}>
        <Panel id="publish-now" title="Publish" description="Makes the draft the live app. The previous version is kept, so it can be rolled back." icon="send">
          {!canPublish ? <Notice tone="info">Your role can prepare changes but not publish them. Ask an owner, administrator or marketer.</Notice> : null}
          <TextField label="What changed" value={note} onChange={setNote} alwaysEditable placeholder="Dashain banner and new remedy prices" maxLength={120} />
          <Button label="Publish now" icon="send" variant="primary" onPress={doPublish} disabled={!canPublish || !dirty.length} />
        </Panel>

        <Panel id="preview" title="Preview in the app" description="Runs the app on this device with the draft, so you can walk through it before anyone else sees it" icon="eye">
          {previewing ? (
            <>
              <Notice tone="warning">This device is showing the draft.</Notice>
              <Row gap={S.sm} wrap>
                <Button label="Open the app" icon="external" variant="primary" onPress={() => router.navigate('/(tabs)' as Href)} />
                <Button label="End preview" onPress={stopPreview} />
              </Row>
            </>
          ) : (
            <Button
              label="Preview the draft"
              icon="play"
              disabled={!can('publish.preview') || !dirty.length}
              onPress={() => {
                setReturnTo('/admin/publish');
                startPreview();
              }}
            />
          )}
        </Panel>

        <Panel
          id="review"
          title="Review changes"
          description="Every field in the draft that differs from live"
          icon="split"
          actions={<Badge label={String(changes.length)} tone={changes.length ? 'brand' : 'success'} />}
        >
          {CONFIG_AREAS.filter((area) => dirty.includes(area.id)).map((area) => {
            const inArea = shown.filter((c) => c.area === area.id);
            if (!inArea.length) return null;
            return (
              <View key={area.id} style={styles.area}>
                <Text style={styles.areaTitle}>{area.label}</Text>
                {inArea.map((change, index) => (
                  <View key={`${change.path}-${index}`} style={styles.change}>
                    <Text style={styles.path}>{change.path || area.label}</Text>
                    <Text style={styles.before} numberOfLines={2}>
                      − {show(change.before)}
                    </Text>
                    <Text style={styles.after} numberOfLines={2}>
                      + {show(change.after)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
          {changes.length > shown.length ? <Button label={`Show all ${changes.length}`} size="sm" variant="ghost" onPress={() => setShowAll(true)} /> : null}
          {!changes.length ? <EmptyState icon="check" title="Nothing to review" body="Edit anything in the dashboard and it appears here." /> : null}
        </Panel>

        <Panel id="schedule" title="Schedule a publish" description="Sends the draft live at a set time. The dashboard has to be open on this device when the time comes." icon="clock">
          {scheduled ? (
            <>
              <Notice tone="info" title={`Scheduled for ${dateTime(scheduled.at)}`}>
                {`By ${scheduled.by}${scheduled.note ? ` — ${scheduled.note}` : ''}`}
              </Notice>
              <Button label="Cancel the schedule" onPress={() => schedulePublish(null)} disabled={!canPublish} />
            </>
          ) : (
            <>
              <DateTimeField label="Publish at" value={when} onChange={setWhen} hint="Year-month-day and 24-hour time, e.g. 2026-10-02 06:00." />
              <Button
                label="Schedule"
                icon="calendar"
                disabled={!canPublish || !when || when < Date.now() || !dirty.length}
                onPress={() => {
                  schedulePublish({ at: when, note: note || 'Scheduled publish', by: me?.name ?? '' });
                  log('Scheduled a publish', 'publish', dateTime(when));
                  toast(`Scheduled for ${dateTime(when)}`);
                }}
              />
              {when && when < Date.now() ? <Text style={styles.warn}>That time has passed.</Text> : null}
            </>
          )}
        </Panel>

        <Panel id="history" title="Version history" description={`The last ${history.length} published versions. Rolling back publishes that version again as a new revision.`} icon="history">
          <View style={styles.version}>
            <View style={[styles.versionDot, styles.versionDotLive]} />
            <View style={styles.flex}>
              <Text style={styles.versionTitle}>Revision {live.meta.revision} · live</Text>
              <Text style={styles.versionMeta}>
                {live.meta.note || 'No note'} · {live.meta.publishedAt ? `${dateTime(live.meta.publishedAt)} · ${live.meta.publishedBy}` : 'as shipped'}
              </Text>
            </View>
          </View>
          {history.map((entry) => (
            <View key={entry.id} style={styles.version}>
              <View style={styles.versionDot} />
              <View style={styles.flex}>
                <Text style={styles.versionTitle}>Revision {entry.revision}</Text>
                <Text style={styles.versionMeta} numberOfLines={2}>
                  {entry.note || 'No note'} · {entry.publishedAt ? `${dateTime(entry.publishedAt)} · ${entry.publishedBy}` : 'as shipped'}
                </Text>
              </View>
              {can('publish.rollback') ? (
                <Button
                  label="Roll back"
                  size="sm"
                  onPress={async () => {
                    const count = diffConfigs(live, entry.config).length;
                    const ok = await confirm({
                      title: `Roll back to revision ${entry.revision}?`,
                      body: `${count} field${count === 1 ? '' : 's'} change back. Your current draft is replaced by that version.`,
                      confirmLabel: 'Roll back',
                      destructive: true,
                    });
                    if (!ok) return;
                    setReturnTo('/admin/publish');
                    rollback(entry.id, me?.name ?? '');
                    log('Rolled back', 'publish', `To revision ${entry.revision}`);
                    toast(`Rolled back to revision ${entry.revision}`);
                  }}
                />
              ) : null}
            </View>
          ))}
          {!history.length ? <Text style={styles.versionMeta}>Nothing published before this one yet.</Text> : null}
        </Panel>

        <Panel id="discard" title="Discard the draft" description="Throws away every unpublished change and starts again from what is live" icon="trash">
          <Button
            label="Discard all changes"
            variant="danger"
            // The draft is shared by the whole team, so throwing it away is
            // for someone who could have published it instead.
            disabled={!dirty.length || !canPublish}
            onPress={async () => {
              const ok = await confirm({
                title: `Discard ${changes.length} change${changes.length === 1 ? '' : 's'}?`,
                body: 'The draft goes back to what is live. This cannot be undone.',
                confirmLabel: 'Discard changes',
                destructive: true,
              });
              if (!ok) return;
              discardDraft();
              log('Discarded the draft', 'publish', `${changes.length} changes`);
              toast('Draft discarded', 'neutral');
            }}
          />
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: S.xl,
    padding: S.xl,
    borderRadius: R.lg,
    backgroundColor: A.surface,
    borderWidth: 1,
    borderColor: A.line,
  },
  heroText: { flex: 1, minWidth: 220, gap: S.sm },
  heroTitle: { ...T.h1, color: A.ink },
  heroBody: { ...T.body, color: A.muted },
  area: { gap: 6 },
  areaTitle: { ...T.eyebrow, color: A.saffronInk, marginTop: S.xs },
  change: { gap: 1, padding: S.sm, borderRadius: R.sm, backgroundColor: A.hover },
  path: { ...T.mono, fontSize: 12, color: A.muted },
  before: { ...T.mono, fontSize: 12, color: A.red },
  after: { ...T.mono, fontSize: 12, color: A.green },
  warn: { ...T.small, color: A.red },
  version: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: 6 },
  versionDot: { width: 10, height: 10, borderRadius: 2, borderWidth: 1.5, borderColor: A.lineStrong, transform: [{ rotate: '45deg' }] },
  versionDotLive: { backgroundColor: A.saffron, borderColor: A.saffron },
  versionTitle: { ...T.label, color: A.ink },
  versionMeta: { ...T.small, color: A.muted },
});
