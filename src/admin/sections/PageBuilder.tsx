import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from 'react-native';

import { CustomPageView } from '@/components/CustomPageView';
import { BLOCK_TYPES, blockId, newBlock } from '@/config/pages';
import type { CustomPage, PageBlock, PageBlockType } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import { useAdmin } from '../auth/store';
import { move, newId, useArea } from '../editor';
import { useCanEdit, useContentWidth } from '../ui/context';
import { NumberField, Segmented, Select, StringList, TextField, Toggle } from '../ui/fields';
import { AIcon } from '../ui/icons';
import { Badge, Button, EmptyState, IconButton, Notice, Panel, Row } from '../ui/kit';
import { Sheet, useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { ImageField, LinkField } from '../ui/pickers';
import { go } from '../ui/Shell';
import { A, R, S, T } from '../ui/theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

export default function PageBuilder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pages = useArea('pages');
  const nav = useArea('navigation');
  const { can } = useAdmin();
  const { toast } = useOverlay();
  const width = useContentWidth();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [adding, setAdding] = useState(false);
  const [openBlock, setOpenBlock] = useState<string | null>(null);

  const page = pages.value.find((p) => p.id === id);
  const canEdit = pages.canEdit;
  const side = width >= 900;

  if (!page) {
    return (
      <AdminPage section="screens" title="Page not found">
        <EmptyState
          icon="page"
          title="This page does not exist in the draft"
          body="It may have been deleted. Your other pages are on the Screens and pages section."
          action={<Button label="Back to pages" onPress={() => go(router, '/admin/screens?tool=pages')} />}
        />
      </AdminPage>
    );
  }

  const set = (next: Partial<CustomPage>, what: string) =>
    pages.update((current) => current.map((p) => (p.id === page.id ? { ...p, ...next, updatedAt: Date.now() } : p)), `${page.title}: ${what}`);

  const setBlocks = (blocks: PageBlock[], what: string) => set({ blocks }, what);
  const setBlock = (block: PageBlock) => setBlocks(page.blocks.map((b) => (b.id === block.id ? block : b)), `edited a ${block.type} block`);

  const slugTaken = pages.value.some((p) => p.id !== page.id && p.slug === page.slug);
  const href = `/page/${page.slug}`;
  const linked = nav.value.profileMenu.some((group) => group.items.some((item) => item.href === href));

  const addToMenu = () => {
    const groups = nav.value.profileMenu;
    if (!groups.length) return;
    const [first, ...rest] = groups;
    nav.update(
      { ...nav.value, profileMenu: [{ ...first, items: [...first.items, { id: newId('row'), label: page.title, icon: 'star', href }] }, ...rest] },
      `linked page ${page.title}`,
    );
    toast(`Added to “${first.title}” in the profile menu`);
  };

  const settings = (
    <Panel id="page-settings" title="Page address and publishing" icon="sliders">
      <TextField label="Title" value={page.title} maxLength={48} onChange={(title) => set({ title }, 'title')} />
      <TextField label="Line under the title" value={page.subtitle} maxLength={120} onChange={(subtitle) => set({ subtitle }, 'subtitle')} />
      <TextField
        label="Address"
        value={page.slug}
        mono
        autoCapitalize="none"
        onChange={(slug) => set({ slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') }, 'address')}
        error={slugTaken ? 'Another page already uses this address.' : !page.slug ? 'Give the page an address.' : null}
        hint={`Opens at ${href}`}
      />
      <Toggle
        label="Published"
        description={page.published ? 'Visible in the app once the draft is published' : 'Only visible in the dashboard'}
        value={page.published}
        onChange={(published) => set({ published }, published ? 'published' : 'unpublished')}
      />
      <Row gap={S.sm} wrap>
        <Button label="Open in the app" icon="external" size="sm" onPress={() => router.push(`${href}?draft=1` as Href)} />
        {can('navigation.edit') && !linked ? <Button label="Add to the profile menu" icon="link" size="sm" onPress={addToMenu} /> : null}
        {linked ? <Badge label="In the profile menu" tone="success" icon="check" /> : null}
      </Row>
    </Panel>
  );

  const blocks = (
    <Panel
      id="page-blocks"
      title="Page builder"
      description="The page, block by block. Tap a block to edit it."
      icon="layers"
      actions={canEdit ? <Button label="Add a block" icon="plus" size="sm" variant="primary" onPress={() => setAdding(true)} /> : undefined}
    >
      {page.blocks.map((block, index) => {
        const open = openBlock === block.id;
        const meta = BLOCK_TYPES.find((t) => t.type === block.type);
        return (
          <View key={block.id} style={[styles.block, open && styles.blockOpen]}>
            <View style={styles.blockHeadRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setOpenBlock(open ? null : block.id)}
              style={(state) => [styles.blockHead, (state as Interaction).hovered && styles.blockHeadHover]}
            >
              <Text style={styles.blockIndex}>{index + 1}</Text>
              <View style={styles.flex}>
                <Text style={styles.blockType}>{meta?.label}</Text>
                <Text style={styles.blockSummary} numberOfLines={1}>
                  {summary(block)}
                </Text>
              </View>
              <AIcon name={open ? 'up' : 'down'} size={16} color={A.muted} />
            </Pressable>
              {canEdit ? (
                <View style={styles.blockActions}>
                  <IconButton icon="up" label="Move up" size={30} disabled={index === 0} onPress={() => setBlocks(move(page.blocks, index, -1), 'moved a block')} />
                  <IconButton icon="down" label="Move down" size={30} disabled={index === page.blocks.length - 1} onPress={() => setBlocks(move(page.blocks, index, 1), 'moved a block')} />
                  <IconButton
                    icon="copy"
                    label="Duplicate"
                    size={30}
                    onPress={() => setBlocks([...page.blocks.slice(0, index + 1), { ...block, id: blockId() }, ...page.blocks.slice(index + 1)], 'duplicated a block')}
                  />
                  <IconButton icon="trash" label="Delete" size={30} tone="danger" onPress={() => setBlocks(page.blocks.filter((b) => b.id !== block.id), 'deleted a block')} />
                </View>
              ) : null}
            </View>
            {open ? (
              <View style={styles.blockBody}>
                <BlockEditor block={block} onChange={setBlock} />
              </View>
            ) : null}
          </View>
        );
      })}
      {!page.blocks.length ? (
        <EmptyState
          icon="layers"
          title="An empty page"
          body="Add a heading, some text, a picture or a button."
          action={canEdit ? <Button label="Add the first block" icon="plus" variant="primary" onPress={() => setAdding(true)} /> : undefined}
        />
      ) : null}
    </Panel>
  );

  const preview = (
    <Panel id="page-preview" title="Page preview" description="In the live app’s colours" icon="phone">
      <View style={styles.phone}>
        <View style={styles.phoneBar}>
          <AIcon name="left" size={18} color="#1B1A17" />
          <Text style={styles.phoneTitle} numberOfLines={1}>
            {page.title}
          </Text>
        </View>
        <CustomPageView page={page} />
      </View>
    </Panel>
  );

  return (
    <AdminPage
      section="screens"
      title={page.title || 'Untitled page'}
      description={`${href} · ${page.published ? 'published' : 'not published yet'}`}
      canEdit={canEdit}
      actions={<Button label="All pages" icon="left" variant="ghost" onPress={() => go(router, '/admin/screens?tool=pages')} />}
    >
      {!side ? (
        <Segmented
          value={mode}
          onChange={setMode}
          alwaysEditable
          options={[
            { value: 'edit', label: 'Edit', icon: 'edit' },
            { value: 'preview', label: 'Preview', icon: 'eye' },
          ]}
        />
      ) : null}
      {side ? (
        <View style={styles.split}>
          <View style={styles.splitMain}>
            {settings}
            {blocks}
          </View>
          <View style={styles.splitSide}>{preview}</View>
        </View>
      ) : mode === 'edit' ? (
        <>
          {settings}
          {blocks}
        </>
      ) : (
        preview
      )}

      <Sheet visible={adding} onClose={() => setAdding(false)} title="Add a block" width={560}>
        <View style={styles.types}>
          {BLOCK_TYPES.map((entry) => (
            <Pressable
              key={entry.type}
              accessibilityRole="button"
              onPress={() => {
                const block = newBlock(entry.type as PageBlockType);
                setBlocks([...page.blocks, block], `added a ${entry.type} block`);
                setOpenBlock(block.id);
                setAdding(false);
              }}
              style={(state) => [styles.typeCard, ((state as Interaction).hovered || state.pressed) && styles.typeCardHover]}
            >
              <Text style={styles.typeName}>{entry.label}</Text>
              <Text style={styles.typeNote}>{entry.note}</Text>
            </Pressable>
          ))}
        </View>
      </Sheet>
    </AdminPage>
  );
}

function summary(block: PageBlock): string {
  switch (block.type) {
    case 'heading':
    case 'text':
      return block.text || 'Empty';
    case 'image':
      return block.caption || (block.image ? 'A picture' : 'No picture chosen');
    case 'button':
      return `${block.label} → ${block.href}`;
    case 'callout':
      return block.title || block.text || 'Empty';
    case 'list':
      return `${block.items.length} point${block.items.length === 1 ? '' : 's'}`;
    case 'quote':
      return block.text || 'Empty';
    case 'faq':
      return `${block.items.length} question${block.items.length === 1 ? '' : 's'}`;
    case 'facts':
      return `${block.rows.length} row${block.rows.length === 1 ? '' : 's'}`;
    case 'astrologer':
      return block.astrologerId || 'No astrologer chosen';
    case 'service':
      return block.serviceId || 'No service chosen';
    case 'divider':
      return 'A line';
    case 'spacer':
      return `${block.size} px`;
  }
}

function BlockEditor({ block, onChange }: { block: PageBlock; onChange: (block: PageBlock) => void }) {
  const { draft } = useAppConfig();
  const canEdit = useCanEdit();

  switch (block.type) {
    case 'heading':
      return (
        <>
          <TextField label="Heading" value={block.text} onChange={(text) => onChange({ ...block, text })} maxLength={80} />
          <Segmented label="Size" value={block.size} onChange={(size) => onChange({ ...block, size })} options={[{ value: 'md', label: 'Section' }, { value: 'lg', label: 'Large' }]} />
        </>
      );
    case 'text':
      return <TextField label="Text" value={block.text} multiline rows={5} onChange={(text) => onChange({ ...block, text })} />;
    case 'image':
      return (
        <>
          <ImageField label="Picture" value={block.image} onChange={(image) => onChange({ ...block, image })} />
          <TextField label="Caption" value={block.caption} onChange={(caption) => onChange({ ...block, caption })} maxLength={120} />
          <NumberField label="Height" value={block.height} min={80} max={480} step={10} suffix="px" onChange={(height) => onChange({ ...block, height: height ?? 180 })} />
        </>
      );
    case 'button':
      return (
        <>
          <TextField label="Label" value={block.label} onChange={(label) => onChange({ ...block, label })} maxLength={32} />
          <LinkField label="Opens" value={block.href} onChange={(href) => onChange({ ...block, href })} />
          <Segmented label="Style" value={block.variant} onChange={(variant) => onChange({ ...block, variant })} options={[{ value: 'solid', label: 'Filled' }, { value: 'outline', label: 'Outline' }]} />
        </>
      );
    case 'callout':
      return (
        <>
          <TextField label="Title" value={block.title} onChange={(title) => onChange({ ...block, title })} maxLength={60} />
          <TextField label="Text" value={block.text} multiline rows={3} onChange={(text) => onChange({ ...block, text })} />
          <Segmented
            label="Tone"
            value={block.tone}
            onChange={(tone) => onChange({ ...block, tone })}
            options={[{ value: 'brand', label: 'Brand' }, { value: 'neutral', label: 'Plain' }, { value: 'success', label: 'Good' }, { value: 'danger', label: 'Warning' }]}
          />
        </>
      );
    case 'list':
      return (
        <>
          <StringList label="Points" items={block.items} onChange={(items) => onChange({ ...block, items })} placeholder="Another point" />
          <Toggle label="Numbered" value={block.ordered} onChange={(ordered) => onChange({ ...block, ordered })} />
        </>
      );
    case 'quote':
      return (
        <>
          <TextField label="Quote" value={block.text} multiline rows={3} onChange={(text) => onChange({ ...block, text })} />
          <TextField label="Who said it" value={block.cite} onChange={(cite) => onChange({ ...block, cite })} />
        </>
      );
    case 'faq':
      return (
        <View style={styles.pairs}>
          {block.items.map((item, index) => (
            <View key={index} style={styles.pair}>
              <TextField label={`Question ${index + 1}`} value={item.q} onChange={(q) => onChange({ ...block, items: block.items.map((it, i) => (i === index ? { ...it, q } : it)) })} />
              <TextField label="Answer" value={item.a} multiline rows={3} onChange={(a) => onChange({ ...block, items: block.items.map((it, i) => (i === index ? { ...it, a } : it)) })} />
              {canEdit ? <Button label="Remove this question" size="sm" variant="ghost" icon="trash" onPress={() => onChange({ ...block, items: block.items.filter((_, i) => i !== index) })} /> : null}
            </View>
          ))}
          {canEdit ? <Button label="Add a question" size="sm" icon="plus" onPress={() => onChange({ ...block, items: [...block.items, { q: '', a: '' }] })} /> : null}
        </View>
      );
    case 'facts':
      return (
        <View style={styles.pairs}>
          {block.rows.map((row, index) => (
            <View key={index} style={styles.factRow}>
              <View style={styles.flex}>
                <TextField label="Label" value={row.label} onChange={(label) => onChange({ ...block, rows: block.rows.map((r, i) => (i === index ? { ...r, label } : r)) })} />
              </View>
              <View style={styles.flex}>
                <TextField label="Value" value={row.value} onChange={(value) => onChange({ ...block, rows: block.rows.map((r, i) => (i === index ? { ...r, value } : r)) })} />
              </View>
              {canEdit ? <IconButton icon="trash" label="Remove row" tone="danger" size={32} onPress={() => onChange({ ...block, rows: block.rows.filter((_, i) => i !== index) })} /> : null}
            </View>
          ))}
          {canEdit ? <Button label="Add a row" size="sm" icon="plus" onPress={() => onChange({ ...block, rows: [...block.rows, { label: '', value: '' }] })} /> : null}
        </View>
      );
    case 'astrologer':
      return (
        <Select
          label="Astrologer"
          value={block.astrologerId}
          options={draft.astrologers.roster.map((a) => ({ value: a.id, label: a.name, hint: a.skills }))}
          onChange={(astrologerId) => onChange({ ...block, astrologerId })}
        />
      );
    case 'service':
      return (
        <Select
          label="Service"
          value={block.serviceId}
          options={draft.services.items.map((s) => ({ value: s.id, label: s.name, hint: s.tagline }))}
          onChange={(serviceId) => onChange({ ...block, serviceId })}
        />
      );
    case 'divider':
      return <Notice tone="info">A thin line. Nothing to set.</Notice>;
    case 'spacer':
      return <NumberField label="Height" value={block.size} min={4} max={120} step={4} suffix="px" onChange={(size) => onChange({ ...block, size: size ?? 24 })} />;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  split: { flexDirection: 'row', gap: S.lg, alignItems: 'flex-start' },
  splitMain: { flex: 1, minWidth: 0, gap: S.lg },
  splitSide: { width: 380 },
  block: { borderRadius: R.md, borderWidth: 1, borderColor: A.line, overflow: 'hidden' },
  blockOpen: { borderColor: A.saffron },
  blockHeadRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  blockHead: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.md, paddingVertical: S.sm },
  blockHeadHover: { backgroundColor: A.hover },
  blockIndex: { ...T.mono, color: A.subtle, width: 18 },
  blockType: { ...T.label, color: A.ink },
  blockSummary: { ...T.small, color: A.muted },
  blockActions: { flexDirection: 'row' },
  blockBody: { padding: S.md, gap: S.md, borderTopWidth: 1, borderTopColor: A.line, backgroundColor: A.hover },
  pairs: { gap: S.md },
  pair: { gap: S.sm, padding: S.md, borderRadius: R.md, backgroundColor: A.surface, borderWidth: 1, borderColor: A.line },
  factRow: { flexDirection: 'row', alignItems: 'flex-end', gap: S.sm },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  typeCard: { flexGrow: 1, flexBasis: 150, padding: S.md, borderRadius: R.md, borderWidth: 1, borderColor: A.line, gap: 2 },
  typeCardHover: { backgroundColor: A.saffronSoft, borderColor: A.saffron },
  typeName: { ...T.label, color: A.ink },
  typeNote: { ...T.small, color: A.muted },
  phone: {
    borderRadius: 28,
    borderWidth: 8,
    borderColor: '#2B2320',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    minHeight: 420,
  },
  phoneBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.md,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEBE4',
  },
  phoneTitle: { ...T.h2, color: '#1B1A17', flex: 1 },
});
