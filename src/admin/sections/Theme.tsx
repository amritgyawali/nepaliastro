import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from 'react-native';

import {
  CONTRAST_PAIRS,
  adjust,
  brandScale,
  contrast,
  darkFrom,
  grade,
  harmonies,
  isColor,
  luminance,
  normalize,
  randomBrand,
} from '@/config/color';
import { THEME_PRESETS } from '@/config/presets';
import { useAppConfig } from '@/config/store';
import type { ColorToken } from '@/theme/colors';
import { themeDefaults } from '@/theme/runtime';

import { useArea } from '../editor';
import { copyText, useOverlay } from '../ui/overlay';
import { useCanEdit, useContentWidth } from '../ui/context';
import { AIcon } from '../ui/icons';
import { Badge, Button, Grid, Notice, Panel, Row } from '../ui/kit';
import { AdminPage } from '../ui/Page';
import { PhonePreview } from '../ui/PhonePreview';
import { ColorField } from '../ui/pickers';
import { A, R, S, T } from '../ui/theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };
type Palette = Record<ColorToken, string>;

const TOKEN_GROUPS: { title: string; tokens: { id: ColorToken; label: string; hint: string; against?: ColorToken }[] }[] = [
  {
    title: 'Brand',
    tokens: [
      { id: 'saffron', label: 'Brand', hint: 'Buttons, selected states — the thing to press' },
      { id: 'saffronPressed', label: 'Brand, pressed', hint: 'A button while it is held' },
      { id: 'saffronDeep', label: 'Brand, deep', hint: 'Brand-coloured text and icons', against: 'white' },
      { id: 'saffronSoft', label: 'Brand, soft', hint: 'Tinted cards, chips and icon tiles' },
      { id: 'saffronBorder', label: 'Brand, border', hint: 'The edge of a tinted card' },
      { id: 'onSaffron', label: 'On brand', hint: 'Text on a brand-coloured button', against: 'saffron' },
    ],
  },
  {
    title: 'Surfaces',
    tokens: [
      { id: 'white', label: 'Surface', hint: 'Screens and cards' },
      { id: 'canvas', label: 'Page background', hint: 'Behind the cards' },
      { id: 'fill', label: 'Input fill', hint: 'Search fields and quiet chips' },
    ],
  },
  {
    title: 'Text',
    tokens: [
      { id: 'ink', label: 'Ink', hint: 'Headings and names', against: 'white' },
      { id: 'body', label: 'Body', hint: 'Running text', against: 'white' },
      { id: 'muted', label: 'Muted', hint: 'Supporting lines', against: 'white' },
      { id: 'subtle', label: 'Subtle', hint: 'Hints and timestamps', against: 'white' },
    ],
  },
  {
    title: 'Lines',
    tokens: [
      { id: 'border', label: 'Border', hint: 'Around cards and fields' },
      { id: 'divider', label: 'Divider', hint: 'Between rows' },
      { id: 'hairline', label: 'Hairline', hint: 'The faintest edge' },
    ],
  },
  {
    title: 'Utility',
    tokens: [
      { id: 'overlay', label: 'Overlay', hint: 'Dims the screen behind a dialog' },
      { id: 'shadow', label: 'Shadow', hint: 'Colour of the few shadows' },
    ],
  },
];

const STATUS: { id: ColorToken; label: string; hint: string; against?: ColorToken }[] = [
  { id: 'green', label: 'Success', hint: 'Online, verified, done', against: 'greenSoft' },
  { id: 'greenSoft', label: 'Success, soft', hint: 'Behind success text' },
  { id: 'red', label: 'Error', hint: 'Errors and destructive actions', against: 'redSoft' },
  { id: 'redSoft', label: 'Error, soft', hint: 'Behind error text' },
];

export default function Theme() {
  const { value: theme, update, canEdit } = useArea('theme');
  const { draft } = useAppConfig();
  const { toast, confirm, prompt } = useOverlay();
  const width = useContentWidth();
  const side = width >= 980;
  const palette = theme.colors;

  const setColors = (next: Partial<Palette>, what: string, presetId?: string) =>
    update((current) => ({ presetId: presetId ?? current.presetId, colors: { ...current.colors, ...next } }), what);

  const setToken = (token: ColorToken, value: string) => setColors({ [token]: value } as Partial<Palette>, `colour ${token}`, 'custom');

  const setBrand = (brand: string) => setColors(brandScale(brand, palette.white), 'brand colour', 'custom');

  const preview = <PhonePreview config={{ ...draft, theme }} width={side ? 270 : Math.min(300, width - 60)} />;

  const panels = (
    <Grid min={360} max={side ? 1 : 2}>
      <Panel id="brand-color" title="Brand colour" description="Pick one colour. Its pressed, deep, soft and border shades, and the text on it, are worked out so they stay readable." icon="palette">
        <ColorField label="Brand" value={palette.saffron} onChange={setBrand} against={palette.white} />
        <View style={styles.derived}>
          {(['saffron', 'saffronPressed', 'saffronDeep', 'saffronSoft', 'saffronBorder', 'onSaffron'] as ColorToken[]).map((token) => (
            <View key={token} style={styles.derivedItem}>
              <View style={[styles.derivedSwatch, { backgroundColor: palette[token] }]} />
              <Text style={styles.derivedLabel} numberOfLines={1}>
                {TOKEN_GROUPS[0].tokens.find((t) => t.id === token)?.label}
              </Text>
            </View>
          ))}
        </View>
      </Panel>

      <Panel id="theme-presets" title="Theme presets" description="Complete palettes. Choosing one replaces every colour." icon="layers">
        <View style={styles.presets}>
          {THEME_PRESETS.map((preset) => {
            const colors = preset.colors();
            const selected = theme.presetId === preset.id;
            return (
              <Pressable
                key={preset.id}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: !canEdit }}
                disabled={!canEdit}
                onPress={() => update({ presetId: preset.id, colors }, `preset ${preset.name}`)}
                style={(state) => [styles.preset, (state as Interaction).hovered && styles.presetHover, selected && styles.presetOn]}
              >
                <View style={[styles.presetFace, { backgroundColor: colors.white, borderColor: colors.border }]}>
                  <View style={[styles.presetBar, { backgroundColor: colors.saffron }]} />
                  <View style={[styles.presetLine, { backgroundColor: colors.ink }]} />
                  <View style={[styles.presetLine, styles.presetLineShort, { backgroundColor: colors.muted }]} />
                  <View style={[styles.presetChip, { backgroundColor: colors.saffronSoft, borderColor: colors.saffronBorder }]} />
                </View>
                <Text style={styles.presetName}>{preset.name}</Text>
                <Text style={styles.presetNote} numberOfLines={2}>
                  {preset.note}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Panel>

      <Panel id="color-tokens" title="Every colour" description="Each token the app’s screens are drawn with. Text colours show their contrast on the surface." icon="sliders">
        {TOKEN_GROUPS.map((group) => (
          <View key={group.title} style={styles.tokenGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.tokens.map((token) => (
              <ColorField
                key={token.id}
                label={token.label}
                hint={token.hint}
                value={palette[token.id]}
                onChange={(value) => setToken(token.id, value)}
                against={token.against ? palette[token.against] : undefined}
                compact
              />
            ))}
          </View>
        ))}
      </Panel>

      <Panel id="status-colors" title="Status colours" description="Kept apart from the brand, so green always means online and red always means a problem" icon="check">
        {STATUS.map((token) => (
          <ColorField
            key={token.id}
            label={token.label}
            hint={token.hint}
            value={palette[token.id]}
            onChange={(value) => setToken(token.id, value)}
            against={token.against ? palette[token.against] : undefined}
            compact
          />
        ))}
        <Row gap={S.sm} wrap>
          <View style={[styles.statusChip, { backgroundColor: palette.greenSoft }]}>
            <Text style={[styles.statusChipText, { color: palette.green }]}>Online</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: palette.redSoft }]}>
            <Text style={[styles.statusChipText, { color: palette.red }]}>Payment failed</Text>
          </View>
        </Row>
      </Panel>

      <Panel id="dark-mode" title="Dark theme" description="Turns the current palette dark: neutrals inverted around a warm black, brand kept, status colours lifted until they read" icon="moon">
        <Row gap={S.sm} wrap>
          <Button
            label="Make it dark"
            icon="moon"
            variant="dark"
            disabled={!canEdit || luminance(palette.white) < 0.2}
            onPress={() => update({ presetId: 'custom-dark', colors: darkFrom(palette) }, 'dark theme')}
          />
          <Button
            label="Back to a light theme"
            icon="sun"
            disabled={!canEdit || luminance(palette.white) >= 0.2}
            onPress={() =>
              update(
                { presetId: 'custom', colors: { ...themeDefaults.colors, ...brandScale(palette.saffron) } },
                'light theme',
              )
            }
          />
        </Row>
        {luminance(palette.white) < 0.2 ? <Notice tone="info">The draft is dark. Photographs and the app icon stay as they are.</Notice> : null}
      </Panel>

      <ContrastPanel palette={palette} onFix={(token, value) => setToken(token, value)} />

      <Panel id="harmony" title="Colour ideas" description="Colours that sit well with your brand colour. Tap one to make it the brand colour." icon="palette">
        {harmonies(palette.saffron).map((set) => (
          <View key={set.name} style={styles.harmony}>
            <Text style={styles.harmonyName}>{set.name}</Text>
            <View style={styles.harmonySwatches}>
              {set.colors.map((color, index) => (
                <Pressable
                  key={`${set.name}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${color}`}
                  disabled={!canEdit}
                  onPress={() => setBrand(color)}
                  style={[styles.harmonySwatch, { backgroundColor: color }]}
                />
              ))}
            </View>
          </View>
        ))}
      </Panel>

      <Panel id="shuffle" title="Surprise me" description="A random, pressable brand colour with every shade worked out. Keep pressing until one fits." icon="shuffle">
        <Button label="Shuffle the brand colour" icon="shuffle" variant="primary" disabled={!canEdit} onPress={() => setBrand(randomBrand())} />
      </Panel>

      <Panel id="palette-io" title="Copy or paste a palette" description="Every colour as text, to move a palette between apps or keep one aside" icon="code">
        <Row gap={S.sm} wrap>
          <Button
            label="Copy palette"
            icon="copy"
            onPress={async () => {
              const ok = await copyText(JSON.stringify(palette, null, 2));
              toast(ok ? 'Palette copied' : 'Copying is not available here — select the text instead', ok ? 'success' : 'warning');
            }}
          />
          <Button
            label="Paste a palette"
            icon="download"
            disabled={!canEdit}
            onPress={async () => {
              const text = await prompt({
                title: 'Paste a palette',
                body: 'Paste the JSON from “Copy palette”. Tokens it leaves out keep their current colour.',
                multiline: true,
                confirmLabel: 'Use this palette',
                validate: (value) => {
                  try {
                    const parsed = JSON.parse(value) as Record<string, string>;
                    const known = Object.keys(parsed).filter((key) => key in palette && isColor(parsed[key]));
                    return known.length ? null : 'No colours in there that the app uses.';
                  } catch {
                    return 'That is not valid JSON.';
                  }
                },
              });
              if (!text) return;
              const parsed = JSON.parse(text) as Record<string, string>;
              const next: Partial<Palette> = {};
              for (const [key, value] of Object.entries(parsed)) {
                if (key in palette && isColor(value)) next[key as ColorToken] = value;
              }
              setColors(next, 'pasted palette', 'custom');
              toast(`${Object.keys(next).length} colours pasted`);
            }}
          />
        </Row>
      </Panel>

      <Panel id="theme-reset" title="Reset colours" description="Back to the saffron palette the app shipped with" icon="refresh">
        <Button
          label="Reset every colour"
          variant="danger"
          disabled={!canEdit}
          onPress={async () => {
            const ok = await confirm({
              title: 'Reset every colour?',
              body: 'The draft goes back to the shipped saffron palette. Nothing changes in the app until you publish.',
              confirmLabel: 'Reset colours',
              destructive: true,
            });
            if (ok) update({ presetId: 'saffron', colors: { ...themeDefaults.colors } }, 'reset colours');
          }}
        />
      </Panel>
    </Grid>
  );

  return (
    <AdminPage section="theme" canEdit={canEdit}>
      {side ? (
        <View style={styles.split}>
          <View style={styles.splitMain}>{panels}</View>
          <View style={styles.splitSide}>
            <Panel id="theme-preview" title="Preview" description="The draft, not what is live" icon="phone">
              {preview}
            </Panel>
          </View>
        </View>
      ) : (
        <>
          <Panel id="theme-preview" title="Preview" description="The draft, not what is live" icon="phone">
            {preview}
          </Panel>
          {panels}
        </>
      )}
    </AdminPage>
  );
}

function ContrastPanel({ palette, onFix }: { palette: Palette; onFix: (token: ColorToken, value: string) => void }) {
  const canEdit = useCanEdit();
  const rows = useMemo(
    () =>
      CONTRAST_PAIRS.map((pair) => {
        const fg = palette[pair.fg];
        const bg = palette[pair.bg];
        const ratio = isColor(fg) && isColor(bg) ? contrast(fg, bg) : 1;
        const needed = pair.large ? 3 : 4.5;
        return { ...pair, ratio, pass: ratio >= needed, needed };
      }),
    [palette],
  );
  const failing = rows.filter((row) => !row.pass).length;

  /** Darkens (or lightens) the text colour until the pair passes. */
  const fix = (fg: ColorToken, bg: ColorToken, needed: number) => {
    let value = normalize(palette[fg]);
    const darker = luminance(palette[bg]) > 0.4;
    for (let i = 0; i < 30 && contrast(value, palette[bg]) < needed + 0.1; i += 1) {
      value = adjust(value, { l: darker ? -0.03 : 0.03 });
    }
    onFix(fg, value);
  };

  return (
    <Panel
      id="contrast"
      title="Contrast check"
      description="Every pair of colours the app draws on top of each other, against WCAG. Normal text needs 4.5:1."
      icon="eye"
      actions={<Badge label={failing ? `${failing} failing` : 'All pass'} tone={failing ? 'danger' : 'success'} />}
    >
      {rows.map((row) => (
        <View key={`${row.fg}-${row.bg}`} style={styles.contrastRow}>
          <View style={[styles.contrastSample, { backgroundColor: palette[row.bg] }]}>
            <Text style={[styles.contrastSampleText, { color: palette[row.fg] }]}>Aa</Text>
          </View>
          <View style={styles.contrastText}>
            <Text style={styles.contrastUse}>{row.use}</Text>
            <Text style={styles.contrastTokens}>
              {row.fg} on {row.bg}
            </Text>
          </View>
          <Text style={styles.contrastRatio}>{row.ratio.toFixed(1)}</Text>
          <Badge label={grade(row.ratio)} tone={row.pass ? (row.ratio >= 7 ? 'success' : 'info') : 'danger'} />
          {!row.pass && canEdit ? <Button label="Fix" size="sm" onPress={() => fix(row.fg, row.bg, row.needed)} /> : null}
        </View>
      ))}
      <View style={styles.contrastNote}>
        <AIcon name="info" size={15} color={A.muted} />
        <Text style={styles.contrastNoteText}>“Fix” moves the text colour lighter or darker until it passes, keeping its hue.</Text>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  split: { flexDirection: 'row', gap: S.lg, alignItems: 'flex-start' },
  splitMain: { flex: 1, minWidth: 0 },
  // Stays in view while the panels scroll past, where the platform can do it.
  splitSide: { width: 320, ...(Platform.OS === 'web' ? { position: 'sticky' as never, top: 0 } : {}) },

  derived: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  derivedItem: { width: 84, gap: 4 },
  derivedSwatch: { height: 36, borderRadius: R.sm, borderWidth: 1, borderColor: A.line },
  derivedLabel: { ...T.small, fontSize: 11.5, color: A.muted },

  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  preset: {
    width: 132,
    padding: S.sm,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: A.line,
    gap: 4,
  },
  presetHover: { backgroundColor: A.hover },
  presetOn: { borderColor: A.saffron, backgroundColor: A.saffronSoft },
  presetFace: { height: 64, borderRadius: R.sm, borderWidth: 1, padding: 8, gap: 5, overflow: 'hidden' },
  presetBar: { height: 10, borderRadius: 3, width: '60%' },
  presetLine: { height: 4, borderRadius: 2, width: '80%' },
  presetLineShort: { width: '50%' },
  presetChip: { position: 'absolute', right: 8, bottom: 8, width: 22, height: 16, borderRadius: 4, borderWidth: 1 },
  presetName: { ...T.label, color: A.ink },
  presetNote: { ...T.small, fontSize: 11.5, lineHeight: 15, color: A.muted },

  tokenGroup: { gap: S.sm },
  groupTitle: { ...T.eyebrow, color: A.muted, marginTop: S.xs },

  statusChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: R.pill },
  statusChipText: { ...T.label, fontSize: 12.5 },

  swatches: { flexDirection: 'row', gap: 3 },
  swatch: { borderRadius: 4 },
  swatchEdge: { borderWidth: 1, borderColor: A.line },

  harmony: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  harmonyName: { ...T.label, color: A.body, width: 110 },
  harmonySwatches: { flexDirection: 'row', gap: 6, flex: 1 },
  harmonySwatch: { flex: 1, maxWidth: 64, height: 32, borderRadius: R.sm },

  contrastRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingVertical: 4 },
  contrastSample: {
    width: 40,
    height: 32,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.line,
  },
  contrastSampleText: { ...T.h3 },
  contrastText: { flex: 1, minWidth: 0 },
  contrastUse: { ...T.label, color: A.ink },
  contrastTokens: { ...T.mono, fontSize: 11, color: A.subtle },
  contrastRatio: { ...T.mono, color: A.ink, width: 34, textAlign: 'right' },
  contrastNote: { flexDirection: 'row', gap: S.sm, alignItems: 'center', marginTop: S.xs },
  contrastNoteText: { ...T.small, color: A.muted, flex: 1 },
});
