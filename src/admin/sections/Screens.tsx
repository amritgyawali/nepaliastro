import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from 'react-native';

import { PAGE_TEMPLATES } from '@/config/pages';
import { APP_SCREENS, type ScreenEntry } from '@/config/screens';
import type { CustomPage, ScreenRule } from '@/config/schema';

import { useAdmin } from '../auth/store';
import { newId, useArea } from '../editor';
import { ago } from '../format';
import { useCanEdit } from '../ui/context';
import { Segmented, TextField, Toggle } from '../ui/fields';
import { AIcon } from '../ui/icons';
import { Badge, Button, EmptyState, Grid, IconButton, ListRow, Notice, Panel, Row } from '../ui/kit';
import { Sheet, useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { go } from '../ui/Shell';
import { A, R, S, T } from '../ui/theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

const GROUPS = ['Tabs', 'Every day', 'Your chart', 'Choosing a time', 'Remedies', 'Consult', 'Account', 'Onboarding'] as const;

function emptyRule(): ScreenRule {
  return { enabled: true, title: '', message: '' };
}

export default function Screens() {
  const router = useRouter();
  const screens = useArea('screens');
  const pages = useArea('pages');
  const features = useArea('features');
  const { can } = useAdmin();
  const { confirm, toast } = useOverlay();
  const canEdit = screens.canEdit;
  const [group, setGroup] = useState<(typeof GROUPS)[number] | 'All'>('All');
  const [editing, setEditing] = useState<ScreenEntry | null>(null);

  const rules = screens.value;
  const ruleFor = (key: string) => rules[key] ?? emptyRule();
  const setRule = (key: string, rule: ScreenRule, what: string) => {
    const next = { ...rules };
    if (rule.enabled && !rule.title.trim() && !rule.message.trim()) delete next[key];
    else next[key] = rule;
    screens.update(next, what);
  };

  const visible = APP_SCREENS.filter((screen) => group === 'All' || screen.group === group);
  const offCount = APP_SCREENS.filter((screen) => !ruleFor(screen.key).enabled).length;
  const renamed = APP_SCREENS.filter((screen) => ruleFor(screen.key).title.trim()).length;

  const createPage = (templateId: string) => {
    const template = PAGE_TEMPLATES.find((t) => t.id === templateId) ?? PAGE_TEMPLATES[0];
    const base = template.build();
    let slug = base.slug;
    let n = 2;
    while (pages.value.some((p) => p.slug === slug)) slug = `${base.slug}-${n++}`;
    const page: CustomPage = { ...base, slug, id: newId('p'), updatedAt: Date.now() };
    pages.update((current) => [...current, page], `new page ${page.title}`);
    go(router, `/admin/page/${page.id}`);
  };

  return (
    <AdminPage section="screens" canEdit={canEdit}>
      <Grid min={420} max={2}>
        <Panel
          id="screen-switches"
          title="Turn screens on or off"
          description="A switched-off screen shows a short message instead, and everything else keeps working. Home, profile and onboarding always stay on."
          icon="toggle"
          actions={<Badge label={offCount ? `${offCount} off` : 'All on'} tone={offCount ? 'warning' : 'success'} />}
        >
          <Segmented
            value={group}
            onChange={setGroup}
            alwaysEditable
            options={[{ value: 'All', label: 'All' }, { value: 'Tabs', label: 'Tabs' }, { value: 'Your chart', label: 'Chart' }, { value: 'Every day', label: 'Daily' }]}
          />
          {visible.map((screen) => {
            const rule = ruleFor(screen.key);
            return (
              <View key={screen.key} style={styles.switchRow}>
                <View style={styles.flex}>
                  <Toggle
                    label={rule.title.trim() || screen.label}
                    description={`${screen.group} · ${screen.key}${screen.essential ? ' · always on' : ''}`}
                    value={rule.enabled}
                    disabled={screen.essential}
                    onChange={(enabled) => setRule(screen.key, { ...rule, enabled }, `${enabled ? 'turned on' : 'turned off'} ${screen.label}`)}
                  />
                </View>
                <IconButton icon="edit" label={`Heading and message for ${screen.label}`} size={32} onPress={() => setEditing(screen)} />
              </View>
            );
          })}
        </Panel>

        <Panel
          id="screen-titles"
          title="Screen headings and messages"
          description="Rename a screen’s heading, or write what a switched-off screen says. Open any screen from the list to edit it."
          icon="text"
          actions={<Badge label={`${renamed} renamed`} />}
        >
          {APP_SCREENS.filter((screen) => rules[screen.key]).map((screen) => {
            const rule = ruleFor(screen.key);
            return (
              <ListRow
                key={screen.key}
                icon={rule.enabled ? 'phone' : 'eyeOff'}
                title={rule.title.trim() || screen.label}
                subtitle={rule.enabled ? `Heading renamed from “${screen.label}”` : rule.message || 'Switched off, default message'}
                onPress={() => setEditing(screen)}
                trailing={<AIcon name="right" size={16} color={A.subtle} />}
              />
            );
          })}
          {!Object.keys(rules).length ? (
            <EmptyState icon="phone" title="Every screen has its own heading" body="Tap the pencil beside a screen to rename it or to write its message." />
          ) : null}
        </Panel>

        <Panel
          id="pages"
          title="Your pages"
          description="Screens you build yourself, at /page/<address>. Link them from the profile menu, a banner or a shortcut."
          icon="page"
          actions={can('screens.edit') ? <Button label="New page" icon="plus" size="sm" variant="primary" onPress={() => createPage('blank')} /> : undefined}
        >
          {pages.value.map((page) => (
            <ListRow
              key={page.id}
              icon="page"
              title={page.title || 'Untitled'}
              subtitle={`/page/${page.slug} · ${page.blocks.length} block${page.blocks.length === 1 ? '' : 's'} · edited ${ago(page.updatedAt)}`}
              onPress={() => go(router, `/admin/page/${page.id}`)}
              trailing={
                <Row gap={4}>
                  <Badge label={page.published ? 'Published' : 'Draft'} tone={page.published ? 'success' : 'neutral'} />
                  {canEdit ? (
                    <IconButton
                      icon="trash"
                      label={`Delete ${page.title}`}
                      tone="danger"
                      size={32}
                      onPress={async () => {
                        const ok = await confirm({ title: `Delete “${page.title}”?`, body: 'Links to it will show “page not available” once you publish.', confirmLabel: 'Delete page', destructive: true });
                        if (ok) {
                          pages.update((current) => current.filter((p) => p.id !== page.id), `deleted page ${page.title}`);
                          toast('Page deleted');
                        }
                      }}
                    />
                  ) : null}
                </Row>
              }
            />
          ))}
          {!pages.value.length ? (
            <EmptyState icon="page" title="No pages yet" body="An About page, a FAQ, an offer — start from a template below." />
          ) : null}
        </Panel>

        <Panel id="page-templates" title="Page templates" description="A new page with its blocks already laid out" icon="layers">
          <View style={styles.templates}>
            {PAGE_TEMPLATES.map((template) => (
              <Pressable
                key={template.id}
                accessibilityRole="button"
                disabled={!canEdit}
                onPress={() => createPage(template.id)}
                style={(state) => [styles.template, ((state as Interaction).hovered || state.pressed) && canEdit && styles.templateHover, !canEdit && styles.inert]}
              >
                <AIcon name="page" size={20} color={A.saffronInk} />
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateNote}>{template.note}</Text>
              </Pressable>
            ))}
          </View>
        </Panel>

        <Panel id="features" title="Feature switches" description="Smaller parts of the app that can be turned off on their own" icon="bolt">
          <Toggle
            label="Pull down to refresh on Home"
            value={features.value.pullToRefresh}
            onChange={(pullToRefresh) => features.patch({ pullToRefresh }, 'pull to refresh')}
          />
          <Toggle
            label="“Chat in progress” card"
            description="At the top of Chat and Call"
            value={features.value.sessionPill}
            onChange={(sessionPill) => features.patch({ sessionPill }, 'session card')}
          />
          <Toggle
            label="Filter chips on Chat and Call"
            value={features.value.directoryFilters}
            onChange={(directoryFilters) => features.patch({ directoryFilters }, 'directory filters')}
          />
        </Panel>

        <Panel id="open-screen" title="Open any screen" description="Jump into the live app at a particular screen, to check it" icon="external">
          <View style={styles.openGrid}>
            {APP_SCREENS.filter((screen) => screen.group !== 'Onboarding').map((screen) => (
              <Pressable
                key={screen.key}
                accessibilityRole="link"
                onPress={() => router.push(screen.sample as Href)}
                style={(state) => [styles.openItem, (state as Interaction).hovered && styles.templateHover]}
              >
                <Text style={styles.openLabel} numberOfLines={1}>
                  {ruleFor(screen.key).title.trim() || screen.label}
                </Text>
                <AIcon name="external" size={13} color={A.subtle} />
              </Pressable>
            ))}
          </View>
        </Panel>
      </Grid>

      <RuleSheet
        screen={editing}
        rule={editing ? ruleFor(editing.key) : emptyRule()}
        onClose={() => setEditing(null)}
        onChange={(rule, what) => editing && setRule(editing.key, rule, what)}
      />
    </AdminPage>
  );
}

function RuleSheet({
  screen,
  rule,
  onClose,
  onChange,
}: {
  screen: ScreenEntry | null;
  rule: ScreenRule;
  onClose: () => void;
  onChange: (rule: ScreenRule, what: string) => void;
}) {
  const canEdit = useCanEdit();
  return (
    <Sheet
      visible={!!screen}
      onClose={onClose}
      title={screen?.label ?? ''}
      subtitle={screen?.key}
      width={520}
      footer={<Button label="Done" variant="primary" onPress={onClose} />}
    >
      {screen ? (
        <>
          <Toggle
            label="Screen is on"
            value={rule.enabled}
            disabled={screen.essential}
            onChange={(enabled) => onChange({ ...rule, enabled }, `${enabled ? 'turned on' : 'turned off'} ${screen.label}`)}
          />
          {screen.essential ? <Notice tone="info">This screen is essential and always stays on.</Notice> : null}
          <TextField
            label="Heading"
            value={rule.title}
            placeholder={screen.label}
            maxLength={40}
            onChange={(title) => onChange({ ...rule, title }, `${screen.label} heading`)}
            hint="Replaces the title at the top of the screen. Empty keeps its own."
          />
          <TextField
            label="Message while it is off"
            value={rule.message}
            multiline
            rows={3}
            maxLength={240}
            placeholder="It will be back soon. Everything else in the app still works."
            onChange={(message) => onChange({ ...rule, message }, `${screen.label} message`)}
          />
          {!canEdit ? <Notice tone="info">You can view these settings, not change them.</Notice> : null}
        </>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: S.xs },
  templates: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  template: {
    flexGrow: 1,
    flexBasis: 140,
    padding: S.md,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: A.line,
    gap: 4,
  },
  templateHover: { backgroundColor: A.saffronSoft, borderColor: A.saffron },
  inert: { opacity: 0.6 },
  templateName: { ...T.label, color: A.ink },
  templateNote: { ...T.small, color: A.muted },
  openGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  openItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: S.md,
    minHeight: 34,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: A.line,
  },
  openLabel: { ...T.label, fontSize: 13, color: A.body },
});
