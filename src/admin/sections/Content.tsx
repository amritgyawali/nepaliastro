import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CONFIG_AREAS, type AppConfig, type ConfigArea } from '@/config/schema';
import { STRING_DEFAULTS, STRING_GROUPS, type StringKey } from '@/config/strings';
import { useAppConfig } from '@/config/store';

import { useAdmin } from '../auth/store';
import { EDIT_PERMISSION, useArea } from '../editor';
import { Chips, StringList, TextField, Toggle } from '../ui/fields';
import { Badge, Button, EmptyState, Grid, IconButton, Notice, Panel, Row } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { A, S, T } from '../ui/theme';

/** Fields that hold ids, links and pictures, never words — left alone by find and replace. */
const NOT_WORDS = new Set(['id', 'href', 'image', 'photo', 'uri', 'slug', 'icon', 'group', 'logo', 'presetId', 'type', 'weight', 'tone', 'variant', 'size', 'model', 'astrologerId', 'serviceId', 'code', 'symbol']);

const SEARCHABLE: ConfigArea[] = ['content', 'services', 'astrologers', 'remedies', 'pages', 'engagement', 'home', 'navigation', 'branding'];

function countIn(value: unknown, needle: string, matchCase: boolean, key = ''): number {
  if (typeof value === 'string') {
    if (NOT_WORDS.has(key) || value.startsWith('data:')) return 0;
    const hay = matchCase ? value : value.toLowerCase();
    const n = matchCase ? needle : needle.toLowerCase();
    return n ? hay.split(n).length - 1 : 0;
  }
  if (Array.isArray(value)) return value.reduce((sum: number, item) => sum + countIn(item, needle, matchCase, key), 0);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((sum, [k, v]) => sum + countIn(v, needle, matchCase, k), 0);
  }
  return 0;
}

function replaceIn(value: unknown, needle: string, next: string, matchCase: boolean, key = ''): unknown {
  if (typeof value === 'string') {
    if (NOT_WORDS.has(key) || value.startsWith('data:')) return value;
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(escaped, matchCase ? 'g' : 'gi'), next);
  }
  if (Array.isArray(value)) return value.map((item) => replaceIn(item, needle, next, matchCase, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceIn(v, needle, next, matchCase, k)]));
  }
  return value;
}

export default function Content() {
  const { value: content, patch, canEdit } = useArea('content');
  const { draft, setDraft } = useAppConfig();
  const { can, log } = useAdmin();
  const { confirm, toast } = useOverlay();
  const [filter, setFilter] = useState('');
  const [find, setFind] = useState('');
  const [replacement, setReplacement] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [areas, setAreas] = useState<ConfigArea[]>(['content', 'services', 'astrologers', 'remedies', 'pages', 'engagement']);

  const strings = content.strings;
  const keys = (Object.keys(STRING_DEFAULTS) as StringKey[]).filter((key) => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return true;
    return key.includes(needle) || STRING_DEFAULTS[key].toLowerCase().includes(needle) || (strings[key] ?? '').toLowerCase().includes(needle);
  });
  const changedCount = Object.keys(strings).filter((k) => strings[k]?.trim()).length;

  const setString = (key: StringKey, value: string) => {
    const next = { ...strings };
    if (value.trim() && value !== STRING_DEFAULTS[key]) next[key] = value;
    else delete next[key];
    patch({ strings: next }, `text ${key}`);
  };

  const editableAreas = areas.filter((area) => can(EDIT_PERMISSION[area]));
  const matches = useMemo(
    () => (find.trim() ? editableAreas.map((area) => ({ area, count: countIn(draft[area], find, matchCase) })) : []),
    [draft, editableAreas, find, matchCase], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const total = matches.reduce((sum, m) => sum + m.count, 0);

  const audit = useMemo(() => {
    const out: { where: string; problem: string }[] = [];
    for (const s of draft.services.items) {
      if (!s.name.trim()) out.push({ where: `Service ${s.id}`, problem: 'No name' });
      if (s.tagline.length > 80) out.push({ where: s.name, problem: `Tagline is ${s.tagline.length} characters; it will wrap to three lines` });
      if (!s.np.trim()) out.push({ where: s.name, problem: 'No Nepali name' });
    }
    for (const r of draft.astrologers.roster) {
      if (!r.about.trim()) out.push({ where: r.name, problem: 'No “about” text for their profile' });
    }
    for (const r of draft.remedies) {
      if (!r.includes.length) out.push({ where: r.title, problem: 'Nothing listed under “what it includes”' });
      if (!r.imageAlt.trim()) out.push({ where: r.title, problem: 'The photo has no description for screen readers' });
    }
    for (const b of draft.engagement.banners) if (b.enabled && !b.title.trim()) out.push({ where: 'A banner', problem: 'Switched on with no title' });
    for (const p of draft.pages) if (!p.title.trim()) out.push({ where: `/page/${p.slug}`, problem: 'No title' });
    if (!draft.content.chatPrompts.length) out.push({ where: 'Chat suggestions', problem: 'Empty — the chat shows no suggestions' });
    return out;
  }, [draft]);

  return (
    <AdminPage section="content" canEdit={canEdit}>
      <Panel
        id="strings"
        title="Screen text"
        description="Headings, notes and buttons across the app. Leave a field empty to use the shipped text."
        icon="text"
        actions={<Badge label={`${changedCount} changed`} tone={changedCount ? 'brand' : 'neutral'} />}
      >
        <TextField value={filter} onChange={setFilter} placeholder="Find a line of text" icon="search" alwaysEditable />
        {STRING_GROUPS.filter((g, i, all) => all.findIndex((x) => x.title === g.title) === i).map((group) => {
          const inGroup = keys.filter((key) => STRING_GROUPS.some((g) => g.title === group.title && key.startsWith(g.prefix)));
          if (!inGroup.length) return null;
          return (
            <View key={group.title} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {inGroup.map((key) => {
                const changed = !!strings[key]?.trim();
                return (
                  <View key={key} style={styles.stringRow}>
                    <View style={styles.flex}>
                      <TextField
                        label={key}
                        value={strings[key] ?? ''}
                        placeholder={STRING_DEFAULTS[key]}
                        multiline={STRING_DEFAULTS[key].length > 60}
                        rows={2}
                        onChange={(value) => setString(key, value)}
                      />
                    </View>
                    {changed && canEdit ? <IconButton icon="refresh" label="Use the shipped text" onPress={() => setString(key, '')} /> : null}
                  </View>
                );
              })}
            </View>
          );
        })}
        {!keys.length ? <EmptyState icon="search" title={`No text matches “${filter}”`} /> : null}
      </Panel>

      <Grid min={400} max={2}>
        <Panel id="find-replace" title="Find and replace" description="Change a word or a phrase everywhere at once — names, taglines, pages, banners. Links and pictures are left alone." icon="search">
          <TextField label="Find" value={find} onChange={setFind} alwaysEditable />
          <TextField label="Replace with" value={replacement} onChange={setReplacement} alwaysEditable />
          <Toggle label="Match capital letters" value={matchCase} onChange={setMatchCase} />
          <Chips
            label="Look in"
            multiple
            value={areas}
            onChange={(next) => setAreas(next as ConfigArea[])}
            options={SEARCHABLE.map((id) => ({ value: id, label: CONFIG_AREAS.find((a) => a.id === id)?.label ?? id }))}
          />
          {find.trim() ? (
            <Text style={styles.matches}>
              {total ? matches.filter((m) => m.count).map((m) => `${m.count} in ${CONFIG_AREAS.find((a) => a.id === m.area)?.label}`).join(' · ') : 'No matches.'}
            </Text>
          ) : null}
          {areas.length > editableAreas.length ? <Notice tone="info">Parts your role cannot edit are skipped.</Notice> : null}
          <Button
            label={total ? `Replace ${total}` : 'Replace'}
            variant="primary"
            disabled={!total}
            onPress={async () => {
              const ok = await confirm({ title: `Replace ${total} match${total === 1 ? '' : 'es'} of “${find}”?`, body: 'This changes the draft. Review it under Publish before it goes live.', confirmLabel: 'Replace' });
              if (!ok) return;
              setDraft((current) => {
                const next: AppConfig = { ...current };
                for (const area of editableAreas) (next as Record<string, unknown>)[area] = replaceIn(current[area], find, replacement, matchCase);
                return next;
              });
              log('Edited the draft', 'content', `Replaced “${find}” with “${replacement}” (${total})`);
              toast(`Replaced ${total}`);
            }}
          />
        </Panel>

        <Panel id="content-audit" title="Text check" description="Missing and over-long text in the draft" icon="check" actions={<Badge label={audit.length ? `${audit.length} to look at` : 'All clear'} tone={audit.length ? 'warning' : 'success'} />}>
          {audit.slice(0, 30).map((item, index) => (
            <View key={index} style={styles.auditRow}>
              <Text style={styles.auditWhere}>{item.where}</Text>
              <Text style={styles.auditProblem}>{item.problem}</Text>
            </View>
          ))}
          {!audit.length ? <EmptyState icon="check" title="Nothing missing" /> : null}
        </Panel>

        <Panel id="chat-prompts" title="Chat suggestions" description="The questions above the message box in a chat with a human astrologer" icon="chat">
          <StringList items={content.chatPrompts} onChange={(chatPrompts) => patch({ chatPrompts }, 'chat suggestions')} placeholder="Will I study abroad?" />
        </Panel>

        <Panel id="baba-prompts" title="Baba’s openers" description="The suggestions in AI Baba’s chat. Ask him to read the chart, not to guess." icon="aiBaba">
          <StringList items={content.babaPrompts} onChange={(babaPrompts) => patch({ babaPrompts }, 'Baba openers')} placeholder="Read my kundli for me" />
        </Panel>

        <Panel id="canned-replies" title="Demo replies" description="What a human astrologer says back in the demo chat, one after another" icon="message">
          <StringList items={content.cannedReplies} onChange={(cannedReplies) => patch({ cannedReplies }, 'demo replies')} multiline placeholder="A reply" />
        </Panel>

        <Panel id="languages" title="Languages" description="The choices on the last onboarding question" icon="globe">
          <StringList items={content.languages} onChange={(languages) => patch({ languages }, 'languages')} placeholder="Maithili" addLabel="Add language" />
          <Row gap={S.sm}>
            <Button
              label="Sort A to Z"
              size="sm"
              disabled={!canEdit}
              onPress={() => patch({ languages: [...content.languages].sort((a, b) => a.localeCompare(b)) }, 'sorted languages')}
            />
          </Row>
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  group: { gap: S.sm },
  groupTitle: { ...T.eyebrow, color: A.muted, marginTop: S.sm },
  stringRow: { flexDirection: 'row', alignItems: 'flex-end', gap: S.xs },
  matches: { ...T.small, color: A.body },
  auditRow: { gap: 1, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: A.line },
  auditWhere: { ...T.label, color: A.ink },
  auditProblem: { ...T.small, color: A.muted },
});
