import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAdmin, type AuditEntry } from '../auth/store';
import { areaLabel } from '../editor';
import { csvCell, dateTime, saveText } from '../format';
import { Select, TextField } from '../ui/fields';
import { Badge, Button, EmptyState, Grid, Panel, Row } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { Avatar } from '../ui/Shell';
import { A, S, T } from '../ui/theme';

const PAGE = 50;

function Entry({ entry, color }: { entry: AuditEntry; color: string }) {
  const security = entry.area === 'security';
  const bad = /fail|lock|block/i.test(entry.action);
  return (
    <View style={styles.entry}>
      <Avatar name={entry.userName} color={color} size={30} />
      <View style={styles.flex}>
        <Text style={styles.entryTitle}>
          <Text style={styles.entryWho}>{entry.userName}</Text> · {entry.action}
        </Text>
        {entry.detail ? (
          <Text style={styles.entryDetail} numberOfLines={3}>
            {entry.detail}
          </Text>
        ) : null}
        <Text style={styles.entryWhen}>{dateTime(entry.at)}</Text>
      </View>
      <Badge label={security ? 'Security' : areaLabel(entry.area)} tone={bad ? 'danger' : security ? 'info' : 'neutral'} />
    </View>
  );
}

export default function Audit() {
  const { audit, users, can, clearAudit } = useAdmin();
  const { confirm, toast } = useOverlay();
  const [who, setWho] = useState('all');
  const [area, setArea] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const colorOf = (id: string) => users.find((u) => u.id === id)?.color ?? A.subtle;
  const areas = useMemo(() => [...new Set(audit.map((e) => e.area))], [audit]);
  const people = useMemo(() => [...new Map(audit.map((e) => [e.userId, e.userName])).entries()], [audit]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return audit.filter(
      (e) =>
        (who === 'all' || e.userId === who) &&
        (area === 'all' || e.area === area) &&
        (!needle || `${e.action} ${e.detail} ${e.userName}`.toLowerCase().includes(needle)),
    );
  }, [area, audit, query, who]);

  const security = audit.filter((e) => e.area === 'security').slice(0, 20);

  return (
    <AdminPage section="audit">
      <Panel
        id="audit-log"
        title="Activity log"
        description={`${audit.length} entries, newest first. Repeated edits to one field within a few seconds are kept as one entry.`}
        icon="history"
      >
        <Row gap={S.md} wrap align="flex-end">
          <View style={styles.filter}>
            <Select alwaysEditable label="Person" value={who} onChange={setWho} options={[{ value: 'all', label: 'Everyone' }, ...people.map(([id, name]) => ({ value: id, label: name }))]} />
          </View>
          <View style={styles.filter}>
            <Select alwaysEditable label="Part" value={area} onChange={setArea} options={[{ value: 'all', label: 'Everything' }, ...areas.map((a) => ({ value: a, label: a === 'security' ? 'Security' : areaLabel(a) }))]} />
          </View>
          <View style={styles.search}>
            <TextField value={query} onChange={setQuery} placeholder="Search the log" icon="search" alwaysEditable />
          </View>
        </Row>
        {filtered.slice(0, limit).map((entry) => (
          <Entry key={entry.id} entry={entry} color={colorOf(entry.userId)} />
        ))}
        {filtered.length > limit ? <Button label={`Show ${Math.min(PAGE, filtered.length - limit)} more`} variant="ghost" onPress={() => setLimit((n) => n + PAGE)} /> : null}
        {!filtered.length ? <EmptyState icon="history" title="Nothing matches" /> : null}
      </Panel>

      <Grid min={420} max={2}>
        <Panel id="security-events" title="Sign-ins and lockouts" description="The last twenty security events" icon="lock">
          {security.map((entry) => (
            <Entry key={entry.id} entry={entry} color={colorOf(entry.userId)} />
          ))}
          {!security.length ? <EmptyState icon="lock" title="No security events yet" /> : null}
        </Panel>

        <Panel id="audit-export" title="Export the log" description="Everything in the log as a spreadsheet file" icon="download">
          <Row gap={S.sm} wrap>
            <Button
              label="Export CSV"
              icon="download"
              onPress={async () => {
                const rows = ['time,person,action,part,detail', ...audit.map((e) => [new Date(e.at).toISOString(), e.userName, e.action, e.area, e.detail].map(csvCell).join(','))];
                const result = await saveText(`astronepali-activity-${new Date().toISOString().slice(0, 10)}.csv`, rows.join('\n'), 'text/csv');
                toast(result === 'failed' ? 'The file could not be saved' : 'Activity exported', result === 'failed' ? 'danger' : 'success');
              }}
            />
            {can('system.manage') ? (
              <Button
                label="Clear the log"
                variant="danger"
                onPress={async () => {
                  const ok = await confirm({ title: 'Clear the activity log?', body: 'Every entry is deleted, and the clearing itself is logged. Export it first if you may need it.', confirmLabel: 'Clear log', destructive: true });
                  if (ok) clearAudit();
                }}
              />
            ) : null}
          </Row>
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  filter: { flexGrow: 1, flexBasis: 160 },
  search: { flexGrow: 2, flexBasis: 220 },
  entry: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: A.line },
  entryTitle: { ...T.body, color: A.body },
  entryWho: { fontFamily: T.label.fontFamily, color: A.ink },
  entryDetail: { ...T.small, color: A.muted },
  entryWhen: { ...T.small, fontSize: 12, color: A.subtle },
});
