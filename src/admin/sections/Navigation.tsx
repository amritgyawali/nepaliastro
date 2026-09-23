import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/config/icons';
import type { HomeSectionId, MenuGroup, QuickLink, TabConfig, TabId } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import { move, newId, useArea } from '../editor';
import { useCanEdit, useContentWidth } from '../ui/context';
import { Segmented, TextField, Toggle } from '../ui/fields';
import { Badge, Button, Grid, IconButton, Notice, Panel, Row } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { PhonePreview } from '../ui/PhonePreview';
import { IconField, LinkField } from '../ui/pickers';
import { RecordList } from '../ui/RecordList';
import { A, R, S, T } from '../ui/theme';

const SECTION_NOTES: Record<HomeSectionId, string> = {
  notice: 'The notice bar, when one is switched on',
  banners: 'Banners from Announcements',
  quick: 'The round shortcuts',
  nextReading: 'The person’s five-hourly reading',
  daily: 'Today’s rashifal card',
  availableNow: 'Astrologers online now',
  panchang: 'Today’s panchang',
  bookCall: 'Astrologers to call',
};

export default function Navigation() {
  const home = useArea('home');
  const nav = useArea('navigation');
  const { draft } = useAppConfig();
  const width = useContentWidth();
  const canEdit = home.canEdit;
  const h = home.value;
  const n = nav.value;

  const setSections = (sections: typeof h.sections, what: string) => home.patch({ sections }, what);
  const setTabs = (tabs: TabConfig[], what: string) => nav.patch({ tabs }, what);

  return (
    <AdminPage section="navigation" canEdit={canEdit}>
      <Grid min={400} max={2}>
        <Panel id="home-order" title="Home screen order" description="Top to bottom, as the home screen shows them. The eye hides a section." icon="home">
          {h.sections.map((section, index) => (
            <View key={section.id} style={[styles.orderRow, !section.visible && styles.orderRowOff]}>
              <Text style={styles.orderIndex}>{index + 1}</Text>
              <View style={styles.orderText}>
                <Text style={styles.orderTitle}>{section.title}</Text>
                <Text style={styles.orderNote}>{SECTION_NOTES[section.id]}</Text>
              </View>
              {canEdit ? (
                <View style={styles.orderActions}>
                  <IconButton
                    icon={section.visible ? 'eye' : 'eyeOff'}
                    label={section.visible ? `Hide ${section.title}` : `Show ${section.title}`}
                    size={32}
                    onPress={() =>
                      setSections(
                        h.sections.map((s) => (s.id === section.id ? { ...s, visible: !s.visible } : s)),
                        `${section.visible ? 'hid' : 'showed'} ${section.title}`,
                      )
                    }
                  />
                  <IconButton icon="up" label="Move up" size={32} disabled={index === 0} onPress={() => setSections(move(h.sections, index, -1), `moved ${section.title}`)} />
                  <IconButton icon="down" label="Move down" size={32} disabled={index === h.sections.length - 1} onPress={() => setSections(move(h.sections, index, 1), `moved ${section.title}`)} />
                </View>
              ) : (
                <Badge label={section.visible ? 'Shown' : 'Hidden'} tone={section.visible ? 'success' : 'neutral'} />
              )}
            </View>
          ))}
        </Panel>

        <Panel id="home-titles" title="Home section titles" description="The headings above the astrologer rails; the others name the section here" icon="text">
          {h.sections.map((section) => (
            <TextField
              key={section.id}
              label={SECTION_NOTES[section.id]}
              value={section.title}
              maxLength={40}
              onChange={(title) => setSections(h.sections.map((s) => (s.id === section.id ? { ...s, title } : s)), `${section.id} title`)}
            />
          ))}
        </Panel>

        <Panel id="home-search" title="Home search bar" description="The field under the greeting that finds astrologers" icon="search">
          <Toggle label="Show the search bar" value={h.showSearch} onChange={(showSearch) => home.patch({ showSearch }, 'search bar')} />
          <TextField label="Placeholder" value={h.searchPlaceholder} maxLength={40} onChange={(searchPlaceholder) => home.patch({ searchPlaceholder }, 'search placeholder')} />
        </Panel>

        <Panel id="quick-links" title="Shortcuts" description="The round icons under the search bar. Four fit best on a phone." icon="grid">
          <RecordList<QuickLink>
            items={h.quickLinks}
            onChange={(quickLinks, what) => home.patch({ quickLinks }, `shortcuts: ${what}`)}
            getId={(item) => item.id}
            getTitle={(item) => item.label}
            getSubtitle={(item) => item.href}
            leading={(item) => (
              <View style={styles.iconTile}>
                <AppIcon name={item.icon} size={20} color={A.saffronInk} />
              </View>
            )}
            create={() => ({ id: newId('q'), label: 'New shortcut', icon: 'star', href: '/horoscope' })}
            duplicate={(item) => ({ ...item, id: newId('q'), label: `${item.label} copy` })}
            addLabel="Add a shortcut"
            noun="shortcut"
            renderEditor={(item, set) => (
              <>
                <TextField label="Label" value={item.label} maxLength={14} onChange={(label) => set({ ...item, label })} hint="Short: it sits under a small icon." />
                <IconField label="Icon" value={item.icon} onChange={(icon) => set({ ...item, icon })} />
                <LinkField label="Opens" value={item.href} onChange={(href) => set({ ...item, href })} />
              </>
            )}
          />
          {h.quickLinks.length > 5 ? <Notice tone="warning">More than five shortcuts will squeeze on a small phone.</Notice> : null}
        </Panel>

        <Panel id="tabs" title="Bottom tabs" description="Order, names, icons, and which tabs show. Home cannot be hidden." icon="menu">
          {n.tabs.map((tab, index) => (
            <TabRow
              key={tab.id}
              tab={tab}
              first={index === 0}
              last={index === n.tabs.length - 1}
              onChange={(next, what) => setTabs(n.tabs.map((t) => (t.id === tab.id ? next : t)), what)}
              onMove={(by) => setTabs(move(n.tabs, index, by), `moved the ${tab.title} tab`)}
            />
          ))}
          <PhonePreview config={{ ...draft, navigation: n }} width={Math.min(240, width - 80)} />
        </Panel>

        <Panel id="landing-tab" title="First screen" description="The tab the app opens on for someone who has finished onboarding" icon="play">
          <Segmented<TabId>
            value={n.landingTab}
            onChange={(landingTab) => nav.patch({ landingTab }, 'first screen')}
            options={n.tabs.filter((tab) => tab.visible).map((tab) => ({ value: tab.id, label: tab.title }))}
          />
        </Panel>

        <Panel id="profile-menu" title="Profile menu" description="The groups of rows on the profile screen. Rows can open any screen, one of your pages, or a website." icon="user">
          <ProfileMenu groups={n.profileMenu} onChange={(profileMenu, what) => nav.patch({ profileMenu }, `profile menu: ${what}`)} />
        </Panel>
      </Grid>
    </AdminPage>
  );
}

function TabRow({
  tab,
  first,
  last,
  onChange,
  onMove,
}: {
  tab: TabConfig;
  first: boolean;
  last: boolean;
  onChange: (tab: TabConfig, what: string) => void;
  onMove: (by: number) => void;
}) {
  const canEdit = useCanEdit();
  return (
    <View style={[styles.tabRow, !tab.visible && styles.orderRowOff]}>
      <View style={styles.tabHead}>
        <View style={styles.iconTile}>
          <AppIcon name={tab.icon} size={20} color={A.saffronInk} filled />
        </View>
        <Text style={styles.tabId}>{tab.id === 'index' ? 'home' : tab.id}</Text>
        {canEdit ? (
          <View style={styles.orderActions}>
            {tab.id !== 'index' ? (
              <IconButton
                icon={tab.visible ? 'eye' : 'eyeOff'}
                label={tab.visible ? `Hide ${tab.title}` : `Show ${tab.title}`}
                size={32}
                onPress={() => onChange({ ...tab, visible: !tab.visible }, `${tab.visible ? 'hid' : 'showed'} the ${tab.title} tab`)}
              />
            ) : null}
            <IconButton icon="up" label="Move up" size={32} disabled={first} onPress={() => onMove(-1)} />
            <IconButton icon="down" label="Move down" size={32} disabled={last} onPress={() => onMove(1)} />
          </View>
        ) : null}
      </View>
      <View style={styles.tabFields}>
        <View style={styles.tabField}>
          <TextField label="Label" value={tab.title} maxLength={12} onChange={(title) => onChange({ ...tab, title }, `${tab.id} tab label`)} />
        </View>
        <View style={styles.tabField}>
          <IconField label="Icon" value={tab.icon} onChange={(icon) => onChange({ ...tab, icon }, `${tab.id} tab icon`)} />
        </View>
      </View>
    </View>
  );
}

function ProfileMenu({ groups, onChange }: { groups: MenuGroup[]; onChange: (groups: MenuGroup[], what: string) => void }) {
  const canEdit = useCanEdit();
  const { confirm } = useOverlay();
  const setGroup = (group: MenuGroup, what: string) => onChange(groups.map((g) => (g.id === group.id ? group : g)), what);

  return (
    <View style={styles.menu}>
      {groups.map((group, index) => (
        <View key={group.id} style={styles.menuGroup}>
          <Row gap={S.sm}>
            <View style={styles.flex}>
              <TextField label={`Group ${index + 1}`} value={group.title} maxLength={30} onChange={(title) => setGroup({ ...group, title }, 'group title')} />
            </View>
            {canEdit ? (
              <View style={styles.groupActions}>
                <IconButton icon="up" label="Move group up" size={32} disabled={index === 0} onPress={() => onChange(move(groups, index, -1), 'moved a group')} />
                <IconButton icon="down" label="Move group down" size={32} disabled={index === groups.length - 1} onPress={() => onChange(move(groups, index, 1), 'moved a group')} />
                <IconButton
                  icon="trash"
                  label="Delete group"
                  tone="danger"
                  size={32}
                  onPress={async () => {
                    const ok = await confirm({ title: `Delete “${group.title}”?`, body: `Its ${group.items.length} rows go with it.`, confirmLabel: 'Delete group', destructive: true });
                    if (ok) onChange(groups.filter((g) => g.id !== group.id), 'deleted a group');
                  }}
                />
              </View>
            ) : null}
          </Row>
          <RecordList
            items={group.items}
            onChange={(items, what) => setGroup({ ...group, items }, what)}
            getId={(item) => item.id}
            getTitle={(item) => item.label}
            getSubtitle={(item) => item.href}
            leading={(item) => (
              <View style={styles.iconTileSmall}>
                <AppIcon name={item.icon} size={17} color={A.saffronInk} />
              </View>
            )}
            create={() => ({ id: newId('row'), label: 'New row', icon: 'star', href: '/predictions' })}
            duplicate={(item) => ({ ...item, id: newId('row') })}
            addLabel="Add a row"
            noun="row"
            renderEditor={(item, set) => (
              <>
                <TextField label="Label" value={item.label} maxLength={40} onChange={(label) => set({ ...item, label })} />
                <IconField label="Icon" value={item.icon} onChange={(icon) => set({ ...item, icon })} />
                <LinkField label="Opens" value={item.href} onChange={(href) => set({ ...item, href })} />
              </>
            )}
          />
        </View>
      ))}
      {canEdit ? (
        <Button
          label="Add a group"
          icon="plus"
          onPress={() => onChange([...groups, { id: newId('group'), title: 'New group', items: [] }], 'added a group')}
          style={styles.addGroup}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.sm,
    paddingHorizontal: S.sm,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: A.line,
  },
  orderRowOff: { opacity: 0.55, borderStyle: 'dashed' },
  orderIndex: { ...T.mono, color: A.subtle, width: 18, textAlign: 'center' },
  orderText: { flex: 1 },
  orderTitle: { ...T.label, color: A.ink },
  orderNote: { ...T.small, color: A.muted },
  orderActions: { flexDirection: 'row' },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: R.md,
    backgroundColor: A.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileSmall: {
    width: 32,
    height: 32,
    borderRadius: R.sm,
    backgroundColor: A.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: { gap: S.sm, padding: S.md, borderRadius: R.md, borderWidth: 1, borderColor: A.line },
  tabHead: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  tabId: { ...T.mono, color: A.muted, flex: 1 },
  tabFields: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md },
  tabField: { flexGrow: 1, flexBasis: 160 },
  menu: { gap: S.lg },
  menuGroup: { gap: S.sm, padding: S.md, borderRadius: R.md, backgroundColor: A.hover, borderWidth: 1, borderColor: A.line },
  groupActions: { flexDirection: 'row', alignSelf: 'flex-end', paddingBottom: 4 },
  addGroup: { alignSelf: 'flex-start' },
});
