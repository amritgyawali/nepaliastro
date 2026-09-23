import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View, type PressableStateCallbackType } from 'react-native';

import { adjust, contrast, grade, isColor, normalize, parseColor } from '@/config/color';
import { APP_ICON_NAMES, APP_ICONS, AppIcon } from '@/config/icons';
import { imageSource, isExternal } from '@/config/images';
import { SCENE_KEYS, SCENE_ORIGINALS } from '@/config/defaults';
import { APP_SCREENS } from '@/config/screens';
import type { ImageRef } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import { useAdmin } from '../auth/store';
import { newId } from '../editor';
import { PickError, dataUriBytes, formatBytes, pickImage, type PickOptions } from '../media';
import { useCanEdit } from './context';
import { Field, Segmented, TextField } from './fields';
import { AIcon } from './icons';
import { Badge, Button, IconButton, Row } from './kit';
import { Sheet, useOverlay } from './overlay';
import { A, R, S, T } from './theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

/* ------------------------------------------------------------------ *
 * Colour
 * ------------------------------------------------------------------ */

/** Colours picked in this session, newest first — the "recent" row. */
const recentColors: string[] = [];

function remember(color: string) {
  const value = normalize(color);
  const at = recentColors.indexOf(value);
  if (at !== -1) recentColors.splice(at, 1);
  recentColors.unshift(value);
  recentColors.splice(12);
}

const SWATCHES = [
  '#FF9933', '#EE8A1F', '#F2A900', '#E0432B', '#C8203A', '#D6336C', '#9C36B5', '#6741D9',
  '#4B3FD1', '#2563C9', '#1C7ED6', '#0F8A8A', '#2E7D4F', '#2F9E44', '#5C940D', '#8A5A44',
  '#1B1A17', '#3B3934', '#6D6963', '#9B968E', '#E5E1DA', '#F2F0EC', '#F7F5F1', '#FFFFFF',
];

export function ColorField({
  label,
  value,
  onChange,
  hint,
  against,
  compact,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  /** Shows the contrast of this colour on that one. */
  against?: string;
  compact?: boolean;
}) {
  const canEdit = useCanEdit();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setText(value);
    setError(null);
  }, [value]);

  const commit = (next: string) => {
    setText(next);
    if (isColor(next)) {
      setError(null);
      onChange(next.startsWith('#') ? next.toUpperCase() : next);
      remember(next);
    } else setError('Use a hex colour like #FF9933.');
  };

  const ratio = against && isColor(value) && isColor(against) ? contrast(value, against) : null;

  return (
    <Field label={label} hint={error ? undefined : hint} error={error}>
      <View style={[styles.colorRow, !canEdit && styles.readOnly]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Choose ${label ?? 'colour'}`}
          disabled={!canEdit}
          onPress={() => setOpen(true)}
          style={[styles.swatch, compact && styles.swatchCompact, checker(value)]}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isColor(value) ? value : 'transparent', borderRadius: R.sm - 1 }]} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={commit}
          editable={canEdit}
          autoCapitalize="characters"
          autoCorrect={false}
          accessibilityLabel={`${label ?? 'Colour'} hex value`}
          style={styles.hexInput}
        />
        {ratio !== null ? (
          <Badge
            label={`${ratio.toFixed(1)} ${grade(ratio)}`}
            tone={ratio >= 4.5 ? 'success' : ratio >= 3 ? 'warning' : 'danger'}
          />
        ) : null}
      </View>

      <Sheet visible={open} onClose={() => setOpen(false)} title={label ?? 'Colour'} width={440}>
        <ColorWorkbench
          value={value}
          onChange={(next) => {
            onChange(next);
            remember(next);
          }}
        />
      </Sheet>
    </Field>
  );
}

function ColorWorkbench({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const parsed = parseColor(value);
  const nudge = (change: Parameters<typeof adjust>[1]) => onChange(adjust(value, change));

  return (
    <View style={styles.workbench}>
      <View style={[styles.bigSwatch, { backgroundColor: isColor(value) ? value : A.sunken }]}>
        <Text style={[styles.bigSwatchText, { color: parsed && contrast(value, '#000') > 7 ? '#000' : '#FFF' }]}>
          {normalize(value)}
        </Text>
      </View>

      <View style={styles.nudges}>
        {[
          { label: 'Hue', minus: { h: -12 }, plus: { h: 12 } },
          { label: 'Saturation', minus: { s: -0.08 }, plus: { s: 0.08 } },
          { label: 'Lightness', minus: { l: -0.05 }, plus: { l: 0.05 } },
        ].map((row) => (
          <View key={row.label} style={styles.nudgeRow}>
            <Text style={styles.nudgeLabel}>{row.label}</Text>
            <IconButton icon="minus" label={`Less ${row.label.toLowerCase()}`} onPress={() => nudge(row.minus)} />
            <IconButton icon="plus" label={`More ${row.label.toLowerCase()}`} onPress={() => nudge(row.plus)} />
          </View>
        ))}
      </View>

      {recentColors.length ? (
        <View style={styles.swatchGroup}>
          <Text style={styles.groupTitle}>Recently used</Text>
          <SwatchGrid colors={recentColors} value={value} onPick={onChange} />
        </View>
      ) : null}
      <View style={styles.swatchGroup}>
        <Text style={styles.groupTitle}>Palette</Text>
        <SwatchGrid colors={SWATCHES} value={value} onPick={onChange} />
      </View>
    </View>
  );
}

function SwatchGrid({ colors, value, onPick }: { colors: string[]; value: string; onPick: (c: string) => void }) {
  return (
    <View style={styles.swatchGrid}>
      {colors.map((color) => (
        <Pressable
          key={color}
          accessibilityRole="button"
          accessibilityLabel={color}
          onPress={() => onPick(color)}
          style={[
            styles.gridSwatch,
            { backgroundColor: color },
            normalize(color) === normalize(value) && styles.gridSwatchOn,
          ]}
        />
      ))}
    </View>
  );
}

/** A faint border so white and near-white swatches still read as shapes. */
function checker(value: string) {
  return { borderColor: isColor(value) && contrast(value, '#FFFFFF') < 1.3 ? A.lineStrong : 'transparent' };
}

/* ------------------------------------------------------------------ *
 * Pictures
 * ------------------------------------------------------------------ */

export function ImageThumb({ image, size = 56, round }: { image: ImageRef; size?: number; round?: boolean }) {
  const source = imageSource(image);
  const [failed, setFailed] = useState(false);
  React.useEffect(() => setFailed(false), [image]);
  return (
    <View style={[styles.thumb, { width: size, height: size, borderRadius: round ? size / 2 : R.md }]}>
      {source && !failed ? (
        <Image
          source={source}
          style={[StyleSheet.absoluteFill, { borderRadius: round ? size / 2 : R.md }]}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <AIcon name={failed ? 'warning' : 'image'} size={Math.round(size * 0.36)} color={failed ? A.red : A.subtle} />
      )}
    </View>
  );
}

function describe(image: ImageRef): string {
  if (!image) return 'No picture';
  if (image.startsWith('scene:')) {
    const key = image.slice(6);
    return SCENE_ORIGINALS[key]?.alt ?? `Bundled photo: ${key}`;
  }
  if (image.startsWith('data:')) return `Uploaded · ${formatBytes(dataUriBytes(image))}`;
  try {
    return new URL(image).host;
  } catch {
    return image.slice(0, 40);
  }
}

export function ImageField({
  label,
  value,
  onChange,
  hint,
  allowScenes = true,
  round,
  pick,
}: {
  label?: string;
  value: ImageRef;
  onChange: (value: ImageRef) => void;
  hint?: string;
  /** Offer the photographs bundled with the app. */
  allowScenes?: boolean;
  round?: boolean;
  pick?: PickOptions;
}) {
  const canEdit = useCanEdit();
  const [open, setOpen] = useState(false);

  return (
    <Field label={label} hint={hint}>
      <View style={styles.imageRow}>
        <ImageThumb image={value} size={60} round={round} />
        <View style={styles.imageText}>
          <Text style={styles.imageName} numberOfLines={1}>
            {describe(value)}
          </Text>
          {canEdit ? (
            <Row gap={S.sm} wrap>
              <Button label={value ? 'Change' : 'Choose'} icon="image" size="sm" onPress={() => setOpen(true)} />
              {value ? <Button label="Remove" size="sm" variant="ghost" onPress={() => onChange('')} /> : null}
            </Row>
          ) : null}
        </View>
      </View>
      <ImageChooser
        visible={open}
        onClose={() => setOpen(false)}
        value={value}
        onChoose={(next) => {
          onChange(next);
          setOpen(false);
        }}
        allowScenes={allowScenes}
        pick={pick}
        title={label ?? 'Picture'}
      />
    </Field>
  );
}

export function ImageChooser({
  visible,
  onClose,
  value,
  onChoose,
  allowScenes = true,
  pick,
  title = 'Choose a picture',
}: {
  visible: boolean;
  onClose: () => void;
  value?: ImageRef;
  onChoose: (value: ImageRef) => void;
  allowScenes?: boolean;
  pick?: PickOptions;
  title?: string;
}) {
  const { draft, setDraft } = useAppConfig();
  const { can, me, log } = useAdmin();
  const { toast } = useOverlay();
  const [tab, setTab] = useState<'library' | 'upload' | 'link'>('library');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inUse = useMemo(() => {
    const urls = new Set<string>();
    for (const record of draft.astrologers.roster) if (record.photo && !record.photo.startsWith('data:')) urls.add(record.photo);
    if (draft.astrologers.ai.photo) urls.add(draft.astrologers.ai.photo);
    if (draft.astrologers.ongoing.photo) urls.add(draft.astrologers.ongoing.photo);
    for (const item of draft.media.library) urls.delete(item.uri);
    return [...urls].filter((url) => !url.startsWith('scene:'));
  }, [draft]);

  const upload = async () => {
    setError(null);
    setBusy(true);
    try {
      const picked = await pickImage(pick);
      if (!picked) return;
      if (picked.bytes > 900_000) {
        setError(`That picture is ${formatBytes(picked.bytes)} even after shrinking. Choose a smaller one.`);
        return;
      }
      if (can('media.edit')) {
        const id = newId('m');
        setDraft((current) => ({
          ...current,
          media: {
            ...current.media,
            library: [
              {
                id,
                name: `Upload ${new Date().toLocaleDateString()}`,
                uri: picked.uri,
                addedAt: Date.now(),
                addedBy: me?.name ?? '',
                bytes: picked.bytes,
              },
              ...current.media.library,
            ],
          },
        }));
        log('Uploaded a picture', 'media', formatBytes(picked.bytes));
      }
      toast(`Picture added · ${formatBytes(picked.bytes)}`);
      onChoose(picked.uri);
    } catch (problem) {
      setError(problem instanceof PickError ? problem.message : 'The picture could not be added. Try another one.');
    } finally {
      setBusy(false);
    }
  };

  const useLink = () => {
    const url = link.trim();
    if (!/^https:\/\//i.test(url)) {
      setError('Use a link that starts with https://');
      return;
    }
    onChoose(url);
    setLink('');
  };

  const Tile = ({ image, caption }: { image: ImageRef; caption: string }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption}
      onPress={() => onChoose(image)}
      style={(state) => [
        styles.tile,
        (state as Interaction).hovered && styles.tileHover,
        value === image && styles.tileOn,
      ]}
    >
      <ImageThumb image={image} size={88} />
      <Text style={styles.tileCaption} numberOfLines={2}>
        {caption}
      </Text>
    </Pressable>
  );

  return (
    <Sheet visible={visible} onClose={onClose} title={title} width={640}>
      <Segmented
        value={tab}
        onChange={(next) => {
          setTab(next);
          setError(null);
        }}
        alwaysEditable
        options={[
          { value: 'library', label: 'Library', icon: 'image' },
          { value: 'upload', label: 'Upload', icon: 'upload' },
          { value: 'link', label: 'Link', icon: 'link' },
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {tab === 'library' ? (
        <View style={styles.libraryGroups}>
          {draft.media.library.length ? (
            <View style={styles.swatchGroup}>
              <Text style={styles.groupTitle}>Uploaded</Text>
              <View style={styles.tiles}>
                {draft.media.library.map((item) => (
                  <Tile key={item.id} image={item.uri} caption={item.name} />
                ))}
              </View>
            </View>
          ) : null}
          {allowScenes ? (
            <View style={styles.swatchGroup}>
              <Text style={styles.groupTitle}>Photographs bundled with the app</Text>
              <View style={styles.tiles}>
                {SCENE_KEYS.map((key) => (
                  <Tile key={key} image={`scene:${key}`} caption={SCENE_ORIGINALS[key].alt} />
                ))}
              </View>
            </View>
          ) : null}
          {inUse.length ? (
            <View style={styles.swatchGroup}>
              <Text style={styles.groupTitle}>Already used in the app</Text>
              <View style={styles.tiles}>
                {inUse.map((url) => (
                  <Tile key={url} image={url} caption={describe(url)} />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {tab === 'upload' ? (
        <View style={styles.uploadBox}>
          <AIcon name="upload" size={28} color={A.saffronInk} />
          <Text style={styles.uploadTitle}>Upload from this device</Text>
          <Text style={styles.uploadBody}>
            The picture is scaled down to at most {pick?.maxSize ?? 1024} pixels and kept inside the app’s
            config, so it goes wherever the config goes.
          </Text>
          <Button label="Choose a picture" icon="image" variant="primary" onPress={upload} loading={busy} />
        </View>
      ) : null}

      {tab === 'link' ? (
        <View style={styles.linkBox}>
          <TextField
            label="Picture link"
            value={link}
            onChange={setLink}
            placeholder="https://…"
            mono
            alwaysEditable
            hint="The link has to stay online. An upload does not depend on anyone else’s server."
          />
          {/^https:\/\//i.test(link.trim()) ? <ImageThumb image={link.trim()} size={120} /> : null}
          <Button label="Use this link" variant="primary" onPress={useLink} disabled={!link.trim()} />
        </View>
      ) : null}
    </Sheet>
  );
}

/* ------------------------------------------------------------------ *
 * Icons
 * ------------------------------------------------------------------ */

export function IconField({ label, value, onChange }: { label?: string; value: string; onChange: (value: string) => void }) {
  const canEdit = useCanEdit();
  const [open, setOpen] = useState(false);
  const entry = APP_ICONS[value as keyof typeof APP_ICONS];
  return (
    <Field label={label}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Icon'}: ${entry?.label ?? value}`}
        disabled={!canEdit}
        onPress={() => setOpen(true)}
        style={(state) => [styles.iconRow, (state as Interaction).hovered && canEdit && styles.tileHover, !canEdit && styles.readOnly]}
      >
        <View style={styles.iconTile}>
          <AppIcon name={value} size={22} color={A.saffronInk} />
        </View>
        <Text style={styles.iconName}>{entry?.label ?? value}</Text>
        {canEdit ? <AIcon name="down" size={16} color={A.muted} /> : null}
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title="Choose an icon" width={520}>
        <View style={styles.iconGrid}>
          {APP_ICON_NAMES.map((name) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityLabel={APP_ICONS[name].label}
              onPress={() => {
                onChange(name);
                setOpen(false);
              }}
              style={(state) => [styles.iconChoice, (state as Interaction).hovered && styles.tileHover, value === name && styles.tileOn]}
            >
              <AppIcon name={name} size={24} color={value === name ? A.saffronInk : A.body} />
              <Text style={styles.iconChoiceLabel} numberOfLines={1}>
                {APP_ICONS[name].label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Sheet>
    </Field>
  );
}

/* ------------------------------------------------------------------ *
 * Links
 * ------------------------------------------------------------------ */

type Destination = { href: string; label: string; group: string };

/** Everywhere a button, banner or menu row can send someone. */
export function useDestinations(): Destination[] {
  const { draft } = useAppConfig();
  return useMemo(() => {
    const out: Destination[] = [];
    const seen = new Set<string>();
    const add = (href: string, label: string, group: string) => {
      if (seen.has(href)) return;
      seen.add(href);
      out.push({ href, label, group });
    };
    add('/(tabs)', 'Home', 'Tabs');
    add('/(tabs)/services', 'Services', 'Tabs');
    add('/(tabs)/chat', 'Chat', 'Tabs');
    add('/(tabs)/call', 'Call', 'Tabs');
    add('/(tabs)/remedies', 'Remedies', 'Tabs');
    for (const service of draft.services.items) add(service.href, service.name, 'Services');
    for (const page of draft.pages) add(`/page/${page.slug}`, page.title || page.slug, 'Your pages');
    for (const remedy of draft.remedies) add(`/remedy/${remedy.id}`, remedy.title, 'Remedies');
    add('/chat/ai-baba', 'Chat with AI Baba', 'Consult');
    for (const record of draft.astrologers.roster) add(`/astrologer/${record.id}`, record.name, 'Astrologers');
    for (const screen of APP_SCREENS) {
      if (screen.group === 'Account' && !screen.key.includes('[')) add(screen.key, screen.label, 'Account');
    }
    return out;
  }, [draft]);
}

export function LinkField({
  label,
  value,
  onChange,
  hint = 'A screen in the app, one of your pages, or an https:// link.',
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const canEdit = useCanEdit();
  const destinations = useDestinations();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = destinations.find((d) => d.href === value);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = destinations.filter(
      (d) => !needle || d.label.toLowerCase().includes(needle) || d.href.toLowerCase().includes(needle),
    );
    const byGroup = new Map<string, Destination[]>();
    for (const d of matching) byGroup.set(d.group, [...(byGroup.get(d.group) ?? []), d]);
    return [...byGroup.entries()];
  }, [destinations, query]);

  return (
    <Field label={label} hint={hint}>
      <View style={[styles.linkRow, !canEdit && styles.readOnly]}>
        <AIcon name={isExternal(value) ? 'external' : 'link'} size={16} color={A.muted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={canEdit}
          placeholder="/kundli or https://…"
          placeholderTextColor={A.subtle}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label ?? 'Link'}
          style={styles.linkInput}
        />
        {current ? <Badge label={current.label} tone="brand" /> : null}
        {canEdit ? <Button label="Choose" size="sm" onPress={() => setOpen(true)} /> : null}
      </View>
      <Sheet visible={open} onClose={() => setOpen(false)} title="Where should it go?" width={520}>
        <TextField value={query} onChange={setQuery} placeholder="Search screens and pages" icon="search" alwaysEditable />
        {groups.map(([group, items]) => (
          <View key={group} style={styles.swatchGroup}>
            <Text style={styles.groupTitle}>{group}</Text>
            {items.map((item) => (
              <Pressable
                key={item.href}
                accessibilityRole="button"
                onPress={() => {
                  onChange(item.href);
                  setOpen(false);
                  setQuery('');
                }}
                style={(state) => [styles.destination, (state as Interaction).hovered && styles.tileHover, value === item.href && styles.tileOn]}
              >
                <Text style={styles.destinationLabel}>{item.label}</Text>
                <Text style={styles.destinationHref}>{item.href}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </Sheet>
    </Field>
  );
}

const styles = StyleSheet.create({
  readOnly: { opacity: 0.75 },

  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderWidth: 1,
    borderColor: A.lineStrong,
    borderRadius: R.md,
    padding: 4,
    paddingRight: S.sm,
    backgroundColor: A.surface,
  },
  swatch: { width: 34, height: 34, borderRadius: R.sm, borderWidth: 1, overflow: 'hidden' },
  swatchCompact: { width: 28, height: 28 },
  hexInput: { flex: 1, ...T.mono, fontSize: 13.5, color: A.ink, paddingVertical: 6, minWidth: 0, outlineStyle: 'none' } as object,

  workbench: { gap: S.lg },
  bigSwatch: { height: 96, borderRadius: R.lg, alignItems: 'flex-start', justifyContent: 'flex-end', padding: S.md },
  bigSwatchText: { ...T.mono, fontSize: 15 },
  nudges: { gap: 2 },
  nudgeRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  nudgeLabel: { ...T.label, color: A.body, flex: 1 },
  swatchGroup: { gap: S.sm },
  groupTitle: { ...T.eyebrow, color: A.muted },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridSwatch: { width: 34, height: 34, borderRadius: R.sm, borderWidth: 1, borderColor: A.line },
  gridSwatchOn: { borderWidth: 3, borderColor: A.ink },

  thumb: {
    backgroundColor: A.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: A.line,
  },
  imageRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  imageText: { flex: 1, gap: 6, minWidth: 0 },
  imageName: { ...T.small, color: A.muted },
  error: { ...T.small, color: A.red },
  libraryGroups: { gap: S.lg },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  tile: { width: 100, padding: 6, borderRadius: R.md, gap: 4, borderWidth: 1, borderColor: 'transparent' },
  tileHover: { backgroundColor: A.hover },
  tileOn: { borderColor: A.saffron, backgroundColor: A.saffronSoft },
  tileCaption: { ...T.small, fontSize: 11.5, lineHeight: 15, color: A.muted },
  uploadBox: {
    alignItems: 'center',
    gap: S.sm,
    padding: S.xl,
    borderRadius: R.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: A.lineStrong,
  },
  uploadTitle: { ...T.h3, color: A.ink },
  uploadBody: { ...T.small, color: A.muted, textAlign: 'center', maxWidth: 380, marginBottom: S.sm },
  linkBox: { gap: S.md },

  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    borderWidth: 1,
    borderColor: A.lineStrong,
    borderRadius: R.md,
    padding: 5,
    paddingRight: S.md,
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: R.sm,
    backgroundColor: A.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconName: { ...T.body, color: A.ink, flex: 1 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  iconChoice: {
    width: 88,
    alignItems: 'center',
    gap: 6,
    paddingVertical: S.md,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconChoiceLabel: { ...T.small, fontSize: 11.5, color: A.muted },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderWidth: 1,
    borderColor: A.lineStrong,
    borderRadius: R.md,
    paddingLeft: S.md,
    paddingRight: 4,
    minHeight: 42,
    backgroundColor: A.surface,
  },
  linkInput: { flex: 1, ...T.mono, fontSize: 13.5, color: A.ink, paddingVertical: 8, minWidth: 0, outlineStyle: 'none' } as object,
  destination: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm + 2,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  destinationLabel: { ...T.label, color: A.ink },
  destinationHref: { ...T.mono, fontSize: 12, color: A.subtle },
});
