import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/config/icons';
import type { ServiceGroupId, ServiceRecord } from '@/config/schema';

import { newId, useArea } from '../editor';
import { useCanEdit } from '../ui/context';
import { Chips, Segmented, TextField, Toggle } from '../ui/fields';
import { Badge, Grid, Panel } from '../ui/kit';
import { AdminPage } from '../ui/Page';
import { IconField, LinkField } from '../ui/pickers';
import { RecordList } from '../ui/RecordList';
import { A, R, S, T } from '../ui/theme';

const BADGES = ['New', 'Popular', 'Free', 'Hot', 'Updated'];

export default function Services() {
  const { value: services, patch, canEdit } = useArea('services');
  const groups = services.groups;
  const groupName = (id: ServiceGroupId) => groups.find((g) => g.id === id)?.title ?? id;

  const setItems = (items: ServiceRecord[], what: string) => patch({ items }, what);
  const setItem = (item: ServiceRecord, what: string) => setItems(services.items.map((s) => (s.id === item.id ? item : s)), what);

  return (
    <AdminPage section="services" canEdit={canEdit}>
      <Panel
        id="service-list"
        title="Services"
        description="The Services tab lists these by group, in this order. Tap one to rename it, change its icon or where it opens."
        icon="sparkle"
        actions={<Badge label={`${services.items.filter((s) => !s.hidden).length} of ${services.items.length} shown`} />}
      >
        <RecordList<ServiceRecord>
          items={services.items}
          onChange={setItems}
          getId={(s) => s.id}
          getTitle={(s) => s.name}
          getSubtitle={(s) => `${groupName(s.group)} · ${s.tagline}`}
          getBadges={(s) => (s.badge ? [{ label: s.badge, tone: 'brand' }] : [])}
          leading={(s) => (
            <View style={styles.iconTile}>
              <AppIcon name={s.icon} size={20} color={A.saffronInk} />
            </View>
          )}
          isHidden={(s) => s.hidden}
          setHidden={(s, hidden) => ({ ...s, hidden })}
          noun="service"
          searchText={(s) => `${s.name} ${s.np} ${s.tagline} ${s.id}`}
          create={() => ({
            id: newId('svc'),
            href: '/(tabs)/services',
            name: 'New service',
            np: '',
            tagline: 'What it does, in a person’s words',
            icon: 'star',
            group: 'daily',
            needsBirth: false,
            needsTime: false,
            hidden: true,
            badge: '',
          })}
          addLabel="Add a service link"
          canDelete={(s) => s.id.startsWith('svc')}
          renderEditor={(s, set) => (
            <>
              <TextField label="Name" value={s.name} maxLength={32} onChange={(name) => set({ ...s, name })} />
              <TextField label="Name in Nepali" value={s.np} maxLength={32} onChange={(np) => set({ ...s, np })} />
              <TextField label="Tagline" value={s.tagline} maxLength={90} multiline rows={2} onChange={(tagline) => set({ ...s, tagline })} />
              <IconField label="Icon" value={s.icon} onChange={(icon) => set({ ...s, icon })} />
              <Segmented<ServiceGroupId>
                label="Group"
                value={s.group}
                onChange={(group) => set({ ...s, group })}
                options={groups.map((g) => ({ value: g.id, label: g.title.split(' ')[0] }))}
              />
              <LinkField label="Opens" value={s.href} onChange={(href) => set({ ...s, href })} hint="The screen the card opens. The twenty built-in services each have their own." />
              <Chips
                label="Badge"
                value={s.badge || 'none'}
                onChange={(badge) => set({ ...s, badge: badge === 'none' ? '' : (badge as string) })}
                options={[{ value: 'none', label: 'None' }, ...BADGES.map((b) => ({ value: b, label: b }))]}
              />
              <Toggle label="Needs a birth date" description="The card says so before it is opened" value={s.needsBirth} onChange={(needsBirth) => set({ ...s, needsBirth })} />
              <Toggle label="Needs a birth time" value={s.needsTime} onChange={(needsTime) => set({ ...s, needsTime })} />
              <Toggle label="Hidden from the Services tab" value={s.hidden} onChange={(hidden) => set({ ...s, hidden })} />
              <Text style={styles.id}>id: {s.id}</Text>
            </>
          )}
        />
      </Panel>

      <Grid min={380} max={2}>
        <Panel id="service-visibility" title="Show and hide services" description="Tap to switch. A hidden service is off the Services tab and out of search; its screen still opens from a link." icon="eye">
          <ServiceChips
            items={services.items}
            isOn={(s) => !s.hidden}
            onToggle={(s) => setItem({ ...s, hidden: !s.hidden }, `${s.hidden ? 'showed' : 'hid'} ${s.name}`)}
          />
        </Panel>

        <Panel id="service-badges" title="Badges" description="A word on the card. Tap a service to cycle through the badges." icon="tag">
          <ServiceChips
            items={services.items}
            isOn={(s) => !!s.badge}
            label={(s) => (s.badge ? `${s.name} · ${s.badge}` : s.name)}
            onToggle={(s) => {
              const next = s.badge ? BADGES[BADGES.indexOf(s.badge) + 1] ?? '' : BADGES[0];
              setItem({ ...s, badge: next }, `${s.name} badge`);
            }}
          />
        </Panel>

        <Panel id="service-groups" title="Service groups" description="The four headings on the Services tab" icon="layers">
          {groups.map((group) => (
            <View key={group.id} style={styles.groupRow}>
              <View style={styles.flex}>
                <TextField
                  label="Heading"
                  value={group.title}
                  maxLength={32}
                  onChange={(title) => patch({ groups: groups.map((g) => (g.id === group.id ? { ...g, title } : g)) }, `${group.id} group title`)}
                />
              </View>
              <View style={styles.flex}>
                <TextField
                  label="In Nepali"
                  value={group.np}
                  maxLength={32}
                  onChange={(np) => patch({ groups: groups.map((g) => (g.id === group.id ? { ...g, np } : g)) }, `${group.id} group Nepali`)}
                />
              </View>
            </View>
          ))}
        </Panel>
      </Grid>
    </AdminPage>
  );
}

function ServiceChips({
  items,
  isOn,
  onToggle,
  label = (s) => s.name,
}: {
  items: ServiceRecord[];
  isOn: (s: ServiceRecord) => boolean;
  onToggle: (s: ServiceRecord) => void;
  label?: (s: ServiceRecord) => string;
}) {
  const canEdit = useCanEdit();
  return (
    <View style={styles.chips}>
      {items.map((s) => {
        const on = isOn(s);
        return (
          <Text
            key={s.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on, disabled: !canEdit }}
            onPress={canEdit ? () => onToggle(s) : undefined}
            style={[styles.chip, on && styles.chipOn]}
          >
            {label(s)}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 140 },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    backgroundColor: A.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  id: { ...T.mono, color: A.subtle },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    ...T.label,
    fontSize: 13,
    color: A.muted,
    paddingHorizontal: S.md,
    paddingVertical: 5,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: A.line,
    overflow: 'hidden',
  },
  chipOn: { color: A.saffronInk, backgroundColor: A.saffronSoft, borderColor: A.saffron },
  groupRow: { flexDirection: 'row', gap: S.md, flexWrap: 'wrap' },
});
