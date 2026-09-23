import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/config/format';
import { imageSource } from '@/config/images';
import type { AstrologerRecord, Listing } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import { newId, useArea } from '../editor';
import { useCanEdit } from '../ui/context';
import { Chips, NumberField, Segmented, Select, TextField, Toggle } from '../ui/fields';
import { Badge, Button, Grid, Notice, Panel, Row } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { ImageField } from '../ui/pickers';
import { RecordList } from '../ui/RecordList';
import { A, S, T } from '../ui/theme';

const LISTINGS: { value: Listing; label: string }[] = [
  { value: 'featured', label: 'Home rail' },
  { value: 'chat', label: 'Chat list' },
  { value: 'call', label: 'Call list' },
];

function Portrait({ photo, name, size = 42 }: { photo: string; name: string; size?: number }) {
  const source = photo ? imageSource(photo) : undefined;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <View style={[styles.portrait, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.portraitInitials}>{initials}</Text>
      {source ? <Image source={source} style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]} /> : null}
    </View>
  );
}

export default function Astrologers() {
  const { value: a, patch, canEdit } = useArea('astrologers');
  const { draft } = useAppConfig();
  const { confirm, toast } = useOverlay();
  const [percent, setPercent] = useState<number | null>(10);
  const [scope, setScope] = useState<'rate' | 'discount'>('rate');
  const currency = draft.branding.currency;

  const setRoster = (roster: AstrologerRecord[], what: string) => patch({ roster }, what);
  const setOne = (record: AstrologerRecord, what: string) => setRoster(a.roster.map((r) => (r.id === record.id ? record : r)), what);

  const bulk = async (direction: 1 | -1) => {
    if (!percent) return;
    const factor = 1 + (direction * percent) / 100;
    const ok = await confirm({
      title: `${direction > 0 ? 'Raise' : 'Lower'} every ${scope === 'rate' ? 'rate' : 'discounted rate'} by ${percent}%?`,
      body: `${a.roster.length} astrologers. For example ${formatMoney(0.49, currency, { perMinute: true })} becomes ${formatMoney(0.49 * factor, currency, { perMinute: true })}.`,
      confirmLabel: direction > 0 ? 'Raise prices' : 'Lower prices',
    });
    if (!ok) return;
    setRoster(
      a.roster.map((r) =>
        scope === 'rate'
          ? { ...r, rate: Math.max(0, Math.round(r.rate * factor * 100) / 100) }
          : r.discountedRate === null
            ? r
            : { ...r, discountedRate: Math.max(0, Math.round(r.discountedRate * factor * 100) / 100) },
      ),
      `${direction > 0 ? 'raised' : 'lowered'} ${scope}s by ${percent}%`,
    );
    toast('Prices changed in the draft');
  };

  return (
    <AdminPage section="astrologers" canEdit={canEdit}>
      <Panel
        id="roster"
        title="Astrologers"
        description="Everyone who can be chatted with or called. One profile can appear on several lists."
        icon="moon"
        actions={<Badge label={`${a.roster.filter((r) => r.online).length} online of ${a.roster.length}`} tone="success" />}
      >
        <RecordList<AstrologerRecord>
          items={a.roster}
          onChange={setRoster}
          getId={(r) => r.id}
          getTitle={(r) => r.name}
          getSubtitle={(r) =>
            `${r.skills} · ${formatMoney(r.discountedRate ?? r.rate, currency, { perMinute: true })} · ${r.listings.map((l) => LISTINGS.find((x) => x.value === l)?.label).join(', ') || 'on no list'}`
          }
          getBadges={(r) => [
            ...(r.online ? [{ label: 'Online', tone: 'success' as const }] : []),
            ...(r.celebrity ? [{ label: 'Celebrity', tone: 'brand' as const }] : []),
          ]}
          leading={(r) => <Portrait photo={r.photo} name={r.name} />}
          noun="astrologer"
          searchText={(r) => `${r.name} ${r.skills} ${r.languages}`}
          create={() => ({
            id: newId('astro'),
            name: 'New astrologer',
            photo: '',
            skills: 'Vedic',
            languages: 'Nepali, English',
            experience: null,
            rate: 0.49,
            discountedRate: null,
            orders: '',
            rating: null,
            verified: false,
            celebrity: false,
            waitTime: '',
            online: false,
            about: '',
            specialities: ['all'],
            listings: ['chat'],
          })}
          duplicate={(r) => ({ ...r, id: newId('astro'), name: `${r.name} (copy)` })}
          addLabel="Add an astrologer"
          renderEditor={(r, set) => (
            <>
              <ImageField label="Portrait" value={r.photo} onChange={(photo) => set({ ...r, photo })} round pick={{ maxSize: 480, square: true }} />
              <TextField label="Name" value={r.name} maxLength={40} onChange={(name) => set({ ...r, name })} />
              <TextField label="Skills" value={r.skills} onChange={(skills) => set({ ...r, skills })} hint="Comma-separated: Vedic, Tarot, Vastu" />
              <TextField label="Languages" value={r.languages} onChange={(languages) => set({ ...r, languages })} />
              <TextField label="About" value={r.about} multiline rows={4} maxLength={400} onChange={(about) => set({ ...r, about })} hint="Two or three sentences for their profile screen." />
              <Chips<Listing>
                label="Listed on"
                multiple
                value={r.listings}
                onChange={(listings) => set({ ...r, listings: listings as Listing[] })}
                options={LISTINGS}
              />
              <Chips
                label="Directory filters"
                multiple
                value={r.specialities}
                onChange={(specialities) => set({ ...r, specialities: specialities as string[] })}
                options={a.filters.map((f) => ({ value: f.id, label: f.label }))}
              />
              <View style={styles.pair}>
                <View style={styles.half}>
                  <NumberField label={`Rate (${currency.code})`} value={r.rate} min={0} max={1000} step={0.05} decimals={2} onChange={(rate) => set({ ...r, rate: rate ?? 0 })} />
                </View>
                <View style={styles.half}>
                  <NumberField label="Discounted rate" value={r.discountedRate} allowEmpty min={0} max={1000} step={0.05} decimals={2} onChange={(discountedRate) => set({ ...r, discountedRate })} hint="Empty for no discount" />
                </View>
              </View>
              <View style={styles.pair}>
                <View style={styles.half}>
                  <NumberField label="Years of experience" value={r.experience} allowEmpty min={0} max={80} onChange={(experience) => set({ ...r, experience })} />
                </View>
                <View style={styles.half}>
                  <NumberField label="Rating" value={r.rating} allowEmpty min={1} max={5} step={0.5} decimals={1} onChange={(rating) => set({ ...r, rating })} />
                </View>
              </View>
              <View style={styles.pair}>
                <View style={styles.half}>
                  <TextField label="Orders line" value={r.orders} placeholder="10k+ orders" onChange={(orders) => set({ ...r, orders })} />
                </View>
                <View style={styles.half}>
                  <TextField label="Wait" value={r.waitTime} placeholder="wait ~ 2m" onChange={(waitTime) => set({ ...r, waitTime })} />
                </View>
              </View>
              <Toggle label="Online now" value={r.online} onChange={(online) => set({ ...r, online })} />
              <Toggle label="Verified" description="The green seal beside their name" value={r.verified} onChange={(verified) => set({ ...r, verified })} />
              <Toggle label="Celebrity" value={r.celebrity} onChange={(celebrity) => set({ ...r, celebrity })} />
              <Text style={styles.id}>id: {r.id}</Text>
            </>
          )}
        />
      </Panel>

      <Grid min={380} max={2}>
        <Panel id="availability" title="Who is online" description="The green dot, and “Available now” on the home screen" icon="pulse">
          <Row gap={S.sm} wrap>
            <Button label="Everyone online" size="sm" disabled={!canEdit} onPress={() => setRoster(a.roster.map((r) => ({ ...r, online: true })), 'everyone online')} />
            <Button label="Everyone offline" size="sm" disabled={!canEdit} onPress={() => setRoster(a.roster.map((r) => ({ ...r, online: false })), 'everyone offline')} />
          </Row>
          {a.roster.map((r) => (
            <View key={r.id} style={styles.availability}>
              <Portrait photo={r.photo} name={r.name} size={32} />
              <View style={styles.flex}>
                <Toggle label={r.name} description={r.skills} value={r.online} onChange={(online) => setOne({ ...r, online }, `${r.name} ${online ? 'online' : 'offline'}`)} />
              </View>
            </View>
          ))}
        </Panel>

        <Panel id="bulk-pricing" title="Change prices in bulk" description="Every astrologer’s rate at once, rounded to the cent" icon="coins">
          <Segmented
            label="Change"
            value={scope}
            onChange={setScope}
            alwaysEditable
            options={[
              { value: 'rate', label: 'Rates' },
              { value: 'discount', label: 'Discounted rates' },
            ]}
          />
          <NumberField label="By" value={percent} min={1} max={90} suffix="%" onChange={setPercent} />
          <Row gap={S.sm} wrap>
            <Button label="Raise" icon="up" disabled={!canEdit || !percent} onPress={() => bulk(1)} />
            <Button label="Lower" icon="down" disabled={!canEdit || !percent} onPress={() => bulk(-1)} />
            <Button
              label="Clear every discount"
              variant="ghost"
              disabled={!canEdit}
              onPress={() => setRoster(a.roster.map((r) => ({ ...r, discountedRate: null })), 'cleared discounts')}
            />
          </Row>
        </Panel>

        <Panel id="ai-card" title="AI Baba’s card" description="How the AI astrologer appears at the top of Chat. His answers are set under AI astrologer." icon="aiBaba">
          <Toggle
            label="List AI Baba in Chat"
            description="Off takes him out of the list; his chat screen then says he is not available."
            value={a.ai.enabled}
            onChange={(enabled) => patch({ ai: { ...a.ai, enabled } }, `AI Baba ${enabled ? 'listed' : 'unlisted'}`)}
          />
          <ImageField label="Picture" value={a.ai.photo} onChange={(photo) => patch({ ai: { ...a.ai, photo } }, 'AI Baba picture')} round pick={{ maxSize: 480, square: true }} />
          <TextField label="Name" value={a.ai.name} maxLength={40} onChange={(name) => patch({ ai: { ...a.ai, name } }, 'AI Baba name')} />
          <TextField label="Skills" value={a.ai.skills} onChange={(skills) => patch({ ai: { ...a.ai, skills } }, 'AI Baba skills')} />
          <TextField label="Languages" value={a.ai.languages} onChange={(languages) => patch({ ai: { ...a.ai, languages } }, 'AI Baba languages')} />
          <TextField label="About" value={a.ai.about} multiline rows={4} onChange={(about) => patch({ ai: { ...a.ai, about } }, 'AI Baba about')} />
        </Panel>

        <Panel id="directory-filters" title="Directory filters" description="The chips at the top of Chat and Call. “All” is always first." icon="filter">
          <FilterEditor
            filters={a.filters}
            onChange={(filters, what) => patch({ filters }, what)}
          />
        </Panel>

        <Panel id="ongoing-session" title="“Chat in progress” card" description="The resume card at the top of Chat and Call" icon="chat">
          <Toggle label="Show the card" value={a.ongoing.visible} onChange={(visible) => patch({ ongoing: { ...a.ongoing, visible } }, 'session card')} />
          <Select
            label="With"
            value={a.ongoing.id}
            options={a.roster.map((r) => ({ value: r.id, label: r.name }))}
            onChange={(id) => {
              const r = a.roster.find((x) => x.id === id);
              patch({ ongoing: { ...a.ongoing, id, name: r?.name ?? a.ongoing.name, photo: r?.photo ?? a.ongoing.photo } }, 'session astrologer');
            }}
          />
          <TextField label="Status line" value={a.ongoing.status} maxLength={32} onChange={(status) => patch({ ongoing: { ...a.ongoing, status } }, 'session status')} />
        </Panel>

        <Panel id="free-minute" title="Free first minute" description="Offered once onboarding has a birth date and time" icon="clock">
          <Toggle
            label="Offer the free minute"
            description="Off sends people straight to the home screen after onboarding."
            value={a.freeMinute.enabled}
            onChange={(enabled) => patch({ freeMinute: { ...a.freeMinute, enabled } }, `free minute ${enabled ? 'on' : 'off'}`)}
          />
          <Select
            label="With"
            value={a.freeMinute.astrologerId || 'auto'}
            options={[{ value: 'auto', label: 'The best-rated on the chat list' }, ...a.roster.filter((r) => r.listings.includes('chat')).map((r) => ({ value: r.id, label: r.name }))]}
            onChange={(id) => patch({ freeMinute: { ...a.freeMinute, astrologerId: id === 'auto' ? '' : id } }, 'free minute astrologer')}
          />
          <View style={styles.pair}>
            <View style={styles.half}>
              <TextField label="City" value={a.freeMinute.city} onChange={(city) => patch({ freeMinute: { ...a.freeMinute, city } }, 'free minute city')} />
            </View>
            <View style={styles.half}>
              <TextField label="Distance" value={a.freeMinute.distance} onChange={(distance) => patch({ freeMinute: { ...a.freeMinute, distance } }, 'free minute distance')} />
            </View>
          </View>
          {!a.roster.some((r) => r.listings.includes('chat')) ? <Notice tone="warning">Nobody is on the chat list, so there is nobody to offer.</Notice> : null}
        </Panel>
      </Grid>
    </AdminPage>
  );
}

function FilterEditor({
  filters,
  onChange,
}: {
  filters: { id: string; label: string }[];
  onChange: (filters: { id: string; label: string }[], what: string) => void;
}) {
  const canEdit = useCanEdit();
  const [label, setLabel] = useState('');
  return (
    <View style={styles.filters}>
      {filters.map((filter, index) => (
        <View key={filter.id} style={styles.filterRow}>
          <View style={styles.flex}>
            <TextField
              value={filter.label}
              onChange={(next) => onChange(filters.map((f) => (f.id === filter.id ? { ...f, label: next } : f)), 'filter label')}
              accessibilityLabel={`Filter ${index + 1}`}
            />
          </View>
          <Text style={styles.filterId}>{filter.id}</Text>
          {canEdit && filter.id !== 'all' ? (
            <Button label="Remove" size="sm" variant="ghost" onPress={() => onChange(filters.filter((f) => f.id !== filter.id), `removed filter ${filter.label}`)} />
          ) : null}
        </View>
      ))}
      {canEdit ? (
        <Row gap={S.sm}>
          <View style={styles.flex}>
            <TextField value={label} onChange={setLabel} placeholder="New filter, e.g. Vastu" />
          </View>
          <Button
            label="Add"
            icon="plus"
            disabled={!label.trim()}
            onPress={() => {
              const id = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
              if (filters.some((f) => f.id === id)) return;
              onChange([...filters, { id, label: label.trim() }], `added filter ${label.trim()}`);
              setLabel('');
            }}
          />
        </Row>
      ) : null}
      <Text style={styles.hint}>Tick an astrologer’s filters in their profile so they show under the chip.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  portrait: { backgroundColor: A.saffronSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  portraitInitials: { ...T.label, color: A.saffronInk },
  pair: { flexDirection: 'row', gap: S.md, flexWrap: 'wrap' },
  half: { flex: 1, minWidth: 140 },
  id: { ...T.mono, color: A.subtle },
  availability: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  filters: { gap: S.sm },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  filterId: { ...T.mono, color: A.subtle, fontSize: 11 },
  hint: { ...T.small, color: A.muted },
});
