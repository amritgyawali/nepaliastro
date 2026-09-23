import React from 'react';
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from 'react-native';

import { DENSITY_PRESETS, RADIUS_PRESETS, TYPE_PRESETS } from '@/config/presets';
import type { RadiusStep, SpaceStep, TypeStep, Weight } from '@/config/schema';
import { useAppConfig } from '@/config/store';
import { themeDefaults } from '@/theme/runtime';
import { font } from '@/theme/typography';

import { useArea } from '../editor';
import { useCanEdit, useContentWidth } from '../ui/context';
import { NumberField, Segmented, Select } from '../ui/fields';
import { Button, Grid, Notice, Panel, Row } from '../ui/kit';
import { AdminPage } from '../ui/Page';
import { PhonePreview } from '../ui/PhonePreview';
import { A, R, S, T } from '../ui/theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

const STEPS: { id: TypeStep; label: string; sample: string }[] = [
  { id: 'display', label: 'Display', sample: 'Good evening, Sita' },
  { id: 'title', label: 'Title', sample: 'Janma Kundali' },
  { id: 'section', label: 'Section', sample: 'Today’s panchang' },
  { id: 'body', label: 'Body', sample: 'The moon crosses your tenth house today.' },
  { id: 'label', label: 'Label', sample: 'Birth place' },
  { id: 'small', label: 'Small', sample: 'Ends at 4:12 pm' },
  { id: 'caption', label: 'Caption', sample: 'SHUKLA NAVAMI' },
  { id: 'button', label: 'Button', sample: 'Start free chat' },
];

const WEIGHTS: { value: Weight; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
];

const SPACE_STEPS: SpaceStep[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
const RADIUS_STEPS: { id: RadiusStep; label: string; use: string }[] = [
  { id: 'sm', label: 'Small', use: 'Chips and tags' },
  { id: 'md', label: 'Medium', use: 'Buttons and fields' },
  { id: 'lg', label: 'Large', use: 'Cards and tiles' },
];

function PresetRow<P extends { id: string; name: string; note: string }>({
  presets,
  onPick,
}: {
  presets: P[];
  onPick: (preset: P) => void;
}) {
  const canEdit = useCanEdit();
  return (
    <View style={styles.presets}>
      {presets.map((preset) => (
        <Pressable
          key={preset.id}
          accessibilityRole="button"
          disabled={!canEdit}
          onPress={() => onPick(preset)}
          style={(state) => [styles.preset, ((state as Interaction).hovered || state.pressed) && canEdit && styles.presetHover, !canEdit && styles.inert]}
        >
          <Text style={styles.presetName}>{preset.name}</Text>
          <Text style={styles.presetNote}>{preset.note}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function Design() {
  const typography = useArea('typography');
  const layout = useArea('layout');
  const { draft } = useAppConfig();
  const width = useContentWidth();
  const canEdit = typography.canEdit;
  const t = typography.value;
  const l = layout.value;

  const setStep = (step: TypeStep, patch: Partial<(typeof t.steps)[TypeStep]>, what: string) =>
    typography.update((current) => ({ ...current, steps: { ...current.steps, [step]: { ...current.steps[step], ...patch } } }), what);

  const preview = { ...draft, typography: t, layout: l };

  return (
    <AdminPage section="design" canEdit={canEdit}>
      <Grid min={380} max={2}>
        <Panel id="type-presets" title="Type presets" description="Complete type settings to start from" icon="type">
          <PresetRow presets={TYPE_PRESETS} onPick={(preset) => typography.update((current) => preset.apply(current), `type preset ${preset.name}`)} />
        </Panel>

        <Panel id="text-scale" title="Text size" description="Scales every piece of text in the app, including text off the scale below" icon="search">
          <Segmented
            value={String(t.scale)}
            onChange={(value) => typography.patch({ scale: Number(value) }, 'text size')}
            options={[
              { value: '0.9', label: '90%' },
              { value: '1', label: '100%' },
              { value: '1.1', label: '110%' },
              { value: '1.2', label: '120%' },
              { value: '1.3', label: '130%' },
            ]}
          />
          <NumberField label="Exact scale" value={t.scale} min={0.75} max={1.6} step={0.05} decimals={2} onChange={(scale) => typography.patch({ scale: scale ?? 1 }, 'text size')} />
          {t.scale >= 1.25 ? <Notice tone="info">At this size some long names will wrap to two lines. Check the home screen in a preview.</Notice> : null}
        </Panel>

        <Panel id="type-steps" title="Type scale" description="The eight text styles, each with one job" icon="layers">
          {STEPS.map((step) => (
            <View key={step.id} style={styles.stepRow}>
              <Text style={styles.stepName}>{step.label}</Text>
              <View style={styles.stepFields}>
                <View style={styles.stepField}>
                  <NumberField label="Size" value={t.steps[step.id].fontSize} min={9} max={48} step={0.5} decimals={1} onChange={(fontSize) => setStep(step.id, { fontSize: fontSize ?? 14 }, `${step.label} size`)} />
                </View>
                <View style={styles.stepField}>
                  <NumberField label="Line height" value={t.steps[step.id].lineHeight} min={10} max={64} onChange={(lineHeight) => setStep(step.id, { lineHeight: lineHeight ?? 20 }, `${step.label} line height`)} />
                </View>
              </View>
            </View>
          ))}
          <Button
            label="Reset the scale"
            size="sm"
            variant="ghost"
            disabled={!canEdit}
            onPress={() => typography.update((current) => TYPE_PRESETS[0].apply(current), 'reset type scale')}
          />
        </Panel>

        <Panel id="font-weights" title="Weights" description="How heavy each style is. Mukta ships in four weights." icon="type">
          {STEPS.map((step) => (
            <Select
              key={step.id}
              label={step.label}
              value={t.steps[step.id].weight}
              options={WEIGHTS}
              onChange={(weight) => setStep(step.id, { weight }, `${step.label} weight`)}
            />
          ))}
        </Panel>

        <Panel id="type-specimen" title="Specimen" description="Each style as the draft sets it, in English and Nepali" icon="eye" subtle>
          {STEPS.map((step) => {
            const s = t.steps[step.id];
            return (
              <View key={step.id} style={styles.specimen}>
                <Text style={styles.specimenMeta}>
                  {step.label} · {s.fontSize}/{s.lineHeight} · {s.weight}
                </Text>
                <Text
                  style={{ fontFamily: font[s.weight], fontSize: s.fontSize * t.scale, lineHeight: s.lineHeight * t.scale, color: A.ink }}
                  numberOfLines={2}
                >
                  {step.sample} · शुभ साइत
                </Text>
              </View>
            );
          })}
        </Panel>

        <Panel id="density" title="Spacing density" description="Scales every gap, margin and padding together" icon="ruler">
          <PresetRow presets={DENSITY_PRESETS} onPick={(preset) => layout.update((current) => preset.apply(current), `density ${preset.name}`)} />
        </Panel>

        <Panel id="space-scale" title="Spacing steps" description="The six values every gap in the app is chosen from" icon="sliders">
          <View style={styles.spaceGrid}>
            {SPACE_STEPS.map((step) => (
              <View key={step} style={styles.spaceItem}>
                <NumberField
                  label={step.toUpperCase()}
                  value={l.space[step]}
                  min={0}
                  max={64}
                  onChange={(value) => layout.patch({ space: { ...l.space, [step]: value ?? themeDefaults.space[step] } }, `spacing ${step}`)}
                />
                <View style={[styles.spaceBar, { width: Math.min(120, l.space[step] * 3) }]} />
              </View>
            ))}
          </View>
        </Panel>

        <Panel id="corners" title="Corner radius" description="How round cards, buttons and chips are" icon="toggle">
          <PresetRow presets={RADIUS_PRESETS} onPick={(preset) => layout.update((current) => preset.apply(current), `corners ${preset.name}`)} />
          {RADIUS_STEPS.map((step) => (
            <View key={step.id} style={styles.radiusRow}>
              <View style={[styles.radiusSample, { borderRadius: l.radius[step.id] }]} />
              <View style={styles.radiusField}>
                <NumberField
                  label={`${step.label} — ${step.use}`}
                  value={l.radius[step.id]}
                  min={0}
                  max={40}
                  onChange={(value) => layout.patch({ radius: { ...l.radius, [step.id]: value ?? 0 } }, `radius ${step.id}`)}
                />
              </View>
            </View>
          ))}
        </Panel>

        <Panel id="gutter" title="Screen edges" description="The margin between the edge of the phone and the content" icon="ruler">
          <NumberField label="Gutter" value={l.gutter} min={8} max={40} suffix="px" onChange={(gutter) => layout.patch({ gutter: gutter ?? 20 }, 'gutter')} />
        </Panel>

        <Panel id="max-width" title="Width on tablets and computers" description="On a wider screen the app stays a centred column this wide" icon="phone">
          <Segmented
            value={String(l.maxWidth)}
            onChange={(value) => layout.patch({ maxWidth: Number(value) }, 'max width')}
            options={[
              { value: '430', label: 'Phone' },
              { value: '560', label: 'Wide' },
              { value: '720', label: 'Tablet' },
              { value: '10000', label: 'Full' },
            ]}
          />
          <NumberField label="Exact width" value={l.maxWidth} min={320} max={10000} step={10} suffix="px" onChange={(maxWidth) => layout.patch({ maxWidth: maxWidth ?? 430 }, 'max width')} />
        </Panel>

        <Panel id="tab-bar-height" title="Tab bar height" description="The bottom tabs, not counting the phone’s own safe area" icon="menu">
          <NumberField label="Height" value={l.tabBarHeight} min={44} max={90} suffix="px" onChange={(tabBarHeight) => layout.patch({ tabBarHeight: tabBarHeight ?? 58 }, 'tab bar height')} />
        </Panel>

        <Panel id="touch-size" title="Touch target size" description="The smallest a tappable control may be. 44 is Apple’s guidance; 48 is Google’s." icon="bolt">
          <NumberField label="Minimum" value={l.touchSize} min={36} max={64} suffix="px" onChange={(touchSize) => layout.patch({ touchSize: touchSize ?? 44 }, 'touch size')} />
          {l.touchSize < 44 ? <Notice tone="warning">Below 44 pixels, buttons get hard to hit for many people.</Notice> : null}
        </Panel>

        <Panel id="layout-preview" title="Layout preview" description="The draft’s type, spacing and corners together" icon="phone">
          <PhonePreview config={preview} width={Math.min(280, width - 80)} />
          <Row gap={S.sm} wrap>
            <Button
              label="Reset type and layout"
              variant="ghost"
              size="sm"
              disabled={!canEdit}
              onPress={() => {
                typography.update((current) => ({ ...TYPE_PRESETS[0].apply(current), scale: 1 }), 'reset type');
                layout.update(
                  {
                    gutter: themeDefaults.layout.GUTTER,
                    maxWidth: themeDefaults.layout.SCREEN_MAX_WIDTH,
                    tabBarHeight: themeDefaults.layout.TAB_BAR_HEIGHT,
                    touchSize: themeDefaults.layout.TOUCH_SIZE,
                    space: { ...themeDefaults.space },
                    radius: { ...themeDefaults.radius },
                  },
                  'reset layout',
                );
              }}
            />
          </Row>
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  preset: {
    flexGrow: 1,
    flexBasis: 120,
    padding: S.md,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: A.line,
    gap: 2,
  },
  presetHover: { borderColor: A.saffron, backgroundColor: A.saffronSoft },
  inert: { opacity: 0.6 },
  presetName: { ...T.label, color: A.ink },
  presetNote: { ...T.small, color: A.muted },

  stepRow: { gap: 4, paddingBottom: S.sm, borderBottomWidth: 1, borderBottomColor: A.line },
  stepName: { ...T.h3, color: A.ink },
  stepFields: { flexDirection: 'row', gap: S.md, flexWrap: 'wrap' },
  stepField: { flex: 1, minWidth: 140 },

  specimen: { gap: 2, paddingVertical: 4 },
  specimenMeta: { ...T.mono, fontSize: 11, color: A.subtle },

  spaceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md },
  spaceItem: { flexBasis: 150, flexGrow: 1, gap: 6 },
  spaceBar: { height: 6, borderRadius: 3, backgroundColor: A.saffron },

  radiusRow: { flexDirection: 'row', alignItems: 'flex-end', gap: S.md },
  radiusSample: {
    width: 44,
    height: 44,
    backgroundColor: A.saffronSoft,
    borderWidth: 1.5,
    borderColor: A.saffron,
    marginBottom: 2,
  },
  radiusField: { flex: 1 },
});
