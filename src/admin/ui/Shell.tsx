import { usePathname, useRouter, type Href } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type PressableStateCallbackType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppConfig } from '@/config/store';

import { useAdmin } from '../auth/store';
import { SECTIONS, SECTION_GROUPS, sectionForPath, type Section } from '../nav';
import { searchTools, type Tool } from '../tools';
import { ContentWidth } from './context';
import { AIcon } from './icons';
import { Badge, Button, EmptyState, IconButton } from './kit';
import { KundliMark, dirtySummary } from './Kundli';
import { A, BREAKPOINTS, R, RAIL_WIDTH, S, SIDEBAR_WIDTH, T, lift } from './theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

export function go(router: ReturnType<typeof useRouter>, href: string) {
  router.push(href as Href);
}

/** A person's initials in their colour. */
export function Avatar({ name, color, size = 34 }: { name: string; color: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[T.label, { color: '#FFF', fontSize: size * 0.4, lineHeight: size * 0.5 }]}>{initials || '?'}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * The frame around every signed-in section
 * ------------------------------------------------------------------ */

export function Frame({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const mode = width >= BREAKPOINTS.desktop ? 'desktop' : width >= BREAKPOINTS.tablet ? 'tablet' : 'phone';
  const [drawer, setDrawer] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [contentWidth, setContentWidth] = useState(width);
  const pathname = usePathname();
  const section = sectionForPath(pathname);
  const { touch } = useAdmin();

  useEffect(() => {
    touch();
    setDrawer(false);
    setRailOpen(false);
  }, [pathname, touch]);

  // ⌘K / Ctrl+K opens the tool search on a computer.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const doc = (globalThis as { document?: Document }).document;
    if (!doc) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette(true);
      }
    };
    doc.addEventListener('keydown', onKey);
    return () => doc.removeEventListener('keydown', onKey);
  }, []);

  const gutter = mode === 'phone' ? S.lg : S.xl;

  return (
    <View style={styles.frame}>
      {mode !== 'phone' ? (
        <Sidebar compact={mode === 'tablet' && !railOpen} floating={mode === 'tablet' && railOpen} onToggle={() => setRailOpen((v) => !v)} />
      ) : null}

      <View style={styles.main}>
        <TopBar
          mode={mode}
          section={section}
          onMenu={() => (mode === 'phone' ? setDrawer(true) : setRailOpen((v) => !v))}
          onSearch={() => setPalette(true)}
        />
        <PreviewStrip />
        <View style={styles.body} onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}>
          {/* The route's own screen always renders — the router keeps its
              place through it — and each section page checks access itself. */}
          <ContentWidth width={Math.min(contentWidth - gutter * 2, 1180)}>{children}</ContentWidth>
        </View>
        {mode === 'phone' ? <Dock onMenu={() => setDrawer(true)} /> : null}
      </View>

      {mode === 'phone' ? <Drawer visible={drawer} onClose={() => setDrawer(false)} /> : null}
      <CommandPalette visible={palette} onClose={() => setPalette(false)} />
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Sidebar and rail
 * ------------------------------------------------------------------ */

function useVisibleSections(): Section[] {
  const { can } = useAdmin();
  return SECTIONS.filter((section) => section.id !== 'account' && (!section.permission || can(section.permission)));
}

function NavList({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = sectionForPath(pathname);
  const sections = useVisibleSections();
  const { dirty } = useAppConfig();

  return (
    <ScrollView style={styles.navScroll} contentContainerStyle={styles.navContent} showsVerticalScrollIndicator={false}>
      {SECTION_GROUPS.map((group) => {
        const items = sections.filter((section) => section.group === group.id);
        if (!items.length) return null;
        return (
          <View key={group.id} style={styles.navGroup}>
            {group.label && !compact ? <Text style={styles.navGroupLabel}>{group.label}</Text> : null}
            {group.label && compact ? <View style={styles.navGroupRule} /> : null}
            {items.map((section) => {
              const active = current.id === section.id;
              const changed = section.areas.some((area) => dirty.includes(area));
              return (
                <Pressable
                  key={section.id}
                  accessibilityRole="link"
                  accessibilityLabel={section.label}
                  accessibilityState={{ selected: active }}
                  {...({ title: compact ? section.label : undefined } as object)}
                  onPress={() => {
                    go(router, section.href);
                    onNavigate?.();
                  }}
                  style={(state) => [
                    styles.navItem,
                    compact && styles.navItemCompact,
                    ((state as Interaction).hovered || state.pressed) && styles.navItemHover,
                    active && styles.navItemActive,
                  ]}
                >
                  {active ? <View style={styles.navIndicator} /> : null}
                  <AIcon name={section.icon} size={19} color={active ? A.brass : A.mandirMuted} />
                  {!compact ? (
                    <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
                      {section.label}
                    </Text>
                  ) : null}
                  {changed ? <View style={[styles.navDot, compact && styles.navDotCompact]} /> : null}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

function Brand({ compact }: { compact: boolean }) {
  const { live } = useAppConfig();
  return (
    <View style={[styles.brand, compact && styles.brandCompact]}>
      <KundliMark size={30} />
      {!compact ? (
        <View style={styles.brandText}>
          <Text style={styles.brandName} numberOfLines={1}>
            {live.branding.appName}
          </Text>
          <Text style={styles.brandSub}>Control room</Text>
        </View>
      ) : null}
    </View>
  );
}

function UserCard({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const { me, myRole, signOut } = useAdmin();
  if (!me) return null;
  return (
    <View style={[styles.user, compact && styles.userCompact]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Your account"
        onPress={() => {
          go(router, '/admin/account');
          onNavigate?.();
        }}
        style={(state) => [styles.userButton, (state as Interaction).hovered && styles.navItemHover]}
      >
        <Avatar name={me.name} color={me.color} size={32} />
        {!compact ? (
          <View style={styles.userText}>
            <Text style={styles.userName} numberOfLines={1}>
              {me.name}
            </Text>
            <Text style={styles.userRole} numberOfLines={1}>
              {myRole?.name ?? 'No role'}
            </Text>
          </View>
        ) : null}
      </Pressable>
      {!compact ? <IconButton icon="logout" label="Sign out" tone="onDark" onPress={() => signOut()} size={34} /> : null}
    </View>
  );
}

function Sidebar({ compact, floating, onToggle }: { compact: boolean; floating: boolean; onToggle: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <>
      {/* The rail keeps its width in the layout; the expanded panel floats over the page. */}
      {floating ? <View style={{ width: RAIL_WIDTH }} /> : null}
      <View
        style={[
          styles.sidebar,
          { width: compact ? RAIL_WIDTH : SIDEBAR_WIDTH, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, S.sm) },
          floating && styles.sidebarFloating,
        ]}
      >
        <Pressable accessibilityRole="button" accessibilityLabel={compact ? 'Expand menu' : 'Menu'} onPress={onToggle} disabled={!compact && !floating}>
          <Brand compact={compact} />
        </Pressable>
        <NavList compact={compact} onNavigate={floating ? onToggle : undefined} />
        <UserCard compact={compact} />
      </View>
      {floating ? <Pressable style={styles.scrim} onPress={onToggle} accessibilityLabel="Close menu" /> : null}
    </>
  );
}

function Drawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slide, { toValue: visible ? 1 : 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [slide, visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.drawerScrim, { opacity: slide }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, S.sm) },
          { transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [-320, 0] }) }] },
        ]}
      >
        <View style={styles.drawerHead}>
          <Brand compact={false} />
          <IconButton icon="close" label="Close menu" tone="onDark" onPress={onClose} />
        </View>
        <NavList compact={false} onNavigate={onClose} />
        <UserCard compact={false} onNavigate={onClose} />
      </Animated.View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 * Top bar, dock, preview strip
 * ------------------------------------------------------------------ */

function TopBar({
  mode,
  section,
  onMenu,
  onSearch,
}: {
  mode: 'desktop' | 'tablet' | 'phone';
  section: Section;
  onMenu: () => void;
  onSearch: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dirty, previewing, startPreview } = useAppConfig();
  const { can, me } = useAdmin();
  const phone = mode === 'phone';

  const openApp = () => {
    router.navigate('/(tabs)' as Href);
  };

  return (
    <View style={[styles.topbar, { paddingTop: insets.top + (phone ? 6 : 10) }, phone && styles.topbarPhone]}>
      {mode !== 'desktop' ? <IconButton icon="menu" label="Open the menu" onPress={onMenu} /> : null}

      {phone ? (
        <View style={styles.topTitle}>
          <Text style={styles.topTitleText} numberOfLines={1}>
            {section.label}
          </Text>
        </View>
      ) : (
        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Search tools"
          onPress={onSearch}
          style={(state) => [styles.searchButton, (state as Interaction).hovered && styles.searchButtonHover]}
        >
          <AIcon name="search" size={17} color={A.muted} />
          <Text style={styles.searchText}>Search 130+ tools…</Text>
          {Platform.OS === 'web' ? <Text style={styles.kbd}>Ctrl K</Text> : null}
        </Pressable>
      )}

      <View style={styles.topActions}>
        {phone ? <IconButton icon="search" label="Search tools" onPress={onSearch} /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dirtySummary(dirty)}
          {...({ title: dirtySummary(dirty) } as object)}
          onPress={() => go(router, '/admin/publish')}
          style={(state) => [styles.changes, (state as Interaction).hovered && styles.searchButtonHover]}
        >
          <KundliMark size={24} dirty={dirty} line={A.muted} lit={A.saffron} />
          {!phone ? (
            <Text style={styles.changesText}>{dirty.length ? `${dirty.length} to publish` : 'All live'}</Text>
          ) : dirty.length ? (
            <View style={styles.changesCount}>
              <Text style={styles.changesCountText}>{dirty.length}</Text>
            </View>
          ) : null}
        </Pressable>
        {!phone && can('publish.preview') && !previewing ? (
          <Button label="Preview" icon="play" size="sm" onPress={startPreview} disabled={!dirty.length} />
        ) : null}
        {!phone ? <Button label="Open app" icon="external" size="sm" variant="ghost" onPress={openApp} /> : null}
        {mode === 'desktop' && me ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Your account" onPress={() => go(router, '/admin/account')}>
            <Avatar name={me.name} color={me.color} size={32} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function PreviewStrip() {
  const router = useRouter();
  const { previewing, stopPreview } = useAppConfig();
  if (!previewing) return null;
  return (
    <View style={styles.preview}>
      <AIcon name="eye" size={16} color={A.onSaffron} />
      <Text style={styles.previewText}>The app is showing the draft on this device only.</Text>
      <View style={styles.previewActions}>
        <Button label="Look around" size="sm" variant="dark" onPress={() => router.navigate('/(tabs)' as Href)} />
        <Button label="End preview" size="sm" onPress={stopPreview} />
      </View>
    </View>
  );
}

function Dock({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { dirty } = useAppConfig();
  const { can } = useAdmin();
  const items = [
    { href: '/admin', label: 'Overview', icon: 'overview' as const, show: can('dashboard.view') },
    { href: '/admin/tools', label: 'Tools', icon: 'tools' as const, show: can('dashboard.view') },
    { href: '/admin/publish', label: 'Publish', icon: 'send' as const, show: can('publish.preview'), count: dirty.length },
  ].filter((item) => item.show);

  return (
    <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Pressable
            key={item.href}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            onPress={() => go(router, item.href)}
            style={styles.dockItem}
          >
            <View>
              <AIcon name={item.icon} size={21} color={active ? A.saffronInk : A.muted} />
              {item.count ? (
                <View style={styles.dockBadge}>
                  <Text style={styles.dockBadgeText}>{item.count}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.dockLabel, active && styles.dockLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
      <Pressable accessibilityRole="button" accessibilityLabel="All sections" onPress={onMenu} style={styles.dockItem}>
        <AIcon name="menu" size={21} color={A.muted} />
        <Text style={styles.dockLabel}>Sections</Text>
      </Pressable>
    </View>
  );
}

export function NoAccess({ section }: { section: Section }) {
  const router = useRouter();
  const { myRole } = useAdmin();
  return (
    <View style={styles.noAccess}>
      <EmptyState
        icon="lock"
        title={`${section.label} is not part of your role`}
        body={`${myRole?.name ?? 'Your role'} does not include this section. An owner or administrator can change your role on the Team page.`}
        action={<Button label="Back to the overview" onPress={() => go(router, '/admin')} />}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Command palette
 * ------------------------------------------------------------------ */

function CommandPalette({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { can } = useAdmin();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const phone = width < BREAKPOINTS.tablet;

  const allowedSections = useMemo(
    () => new Set(SECTIONS.filter((s) => !s.permission || can(s.permission)).map((s) => s.id)),
    [can],
  );
  const results = useMemo(
    () => searchTools(query).filter((tool) => allowedSections.has(tool.section)).slice(0, 40),
    [allowedSections, query],
  );

  const open = (tool: Tool) => {
    const section = SECTIONS.find((s) => s.id === tool.section)!;
    onClose();
    setQuery('');
    go(router, `${section.href}?tool=${tool.id}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.paletteBackdrop, phone && { paddingTop: insets.top + S.sm, padding: S.sm }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close search" />
        <View style={[styles.palette, phone && styles.palettePhone]}>
          <View style={styles.paletteInput}>
            <AIcon name="search" size={19} color={A.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="What do you want to change?"
              placeholderTextColor={A.subtle}
              autoFocus
              onSubmitEditing={() => results[0] && open(results[0])}
              returnKeyType="go"
              accessibilityLabel="Search tools"
              style={styles.paletteText}
            />
            <IconButton icon="close" label="Close search" onPress={onClose} size={32} />
          </View>
          <ScrollView style={styles.paletteResults} keyboardShouldPersistTaps="handled">
            {results.map((tool) => {
              const section = SECTIONS.find((s) => s.id === tool.section)!;
              return (
                <Pressable
                  key={tool.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${tool.title}, in ${section.label}`}
                  onPress={() => open(tool)}
                  style={(state) => [styles.paletteRow, ((state as Interaction).hovered || state.pressed) && styles.paletteRowHover]}
                >
                  <View style={styles.paletteIcon}>
                    <AIcon name={section.icon} size={16} color={A.saffronInk} />
                  </View>
                  <View style={styles.paletteRowText}>
                    <Text style={styles.paletteTitle}>{tool.title}</Text>
                    <Text style={styles.paletteDesc} numberOfLines={1}>
                      {tool.description}
                    </Text>
                  </View>
                  {!phone ? <Badge label={section.label} /> : null}
                </Pressable>
              );
            })}
            {!results.length ? (
              <EmptyState icon="search" title={`Nothing matches “${query}”`} body="Try a shorter word — “colour”, “logo”, “price”." />
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, flexDirection: 'row', backgroundColor: A.canvas },
  main: { flex: 1, minWidth: 0 },
  body: { flex: 1 },

  sidebar: { backgroundColor: A.mandir, zIndex: 20 },
  sidebarFloating: { position: 'absolute', left: 0, top: 0, bottom: 0, ...lift },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(20,10,11,0.25)', zIndex: 10 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg + 2,
    paddingVertical: S.lg,
  },
  brandCompact: { justifyContent: 'center', paddingHorizontal: 0 },
  brandText: { flex: 1 },
  brandName: { ...T.h3, color: A.mandirText },
  brandSub: { ...T.eyebrow, color: A.brass, fontSize: 10.5 },

  navScroll: { flex: 1 },
  navContent: { paddingHorizontal: S.sm + 2, paddingBottom: S.lg, gap: S.md },
  navGroup: { gap: 2 },
  navGroupLabel: { ...T.eyebrow, color: A.mandirMuted, opacity: 0.75, paddingHorizontal: S.md, marginBottom: 4, fontSize: 10.5 },
  navGroupRule: { height: 1, backgroundColor: A.mandirLine, marginHorizontal: S.sm, marginBottom: 6 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.md,
    minHeight: 38,
    borderRadius: R.md,
  },
  navItemCompact: { justifyContent: 'center', paddingHorizontal: 0 },
  navItemHover: { backgroundColor: A.mandirRaised },
  navItemActive: { backgroundColor: A.mandirActive },
  navIndicator: { position: 'absolute', left: 0, top: 9, bottom: 9, width: 3, borderRadius: 2, backgroundColor: A.brass },
  navLabel: { ...T.label, color: A.mandirMuted, flex: 1 },
  navLabelActive: { color: A.mandirText },
  navDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: A.saffron },
  navDotCompact: { position: 'absolute', top: 8, right: 14 },

  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: S.sm + 2,
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: A.mandirLine,
  },
  userCompact: { justifyContent: 'center' },
  userButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: 6, borderRadius: R.md },
  userText: { flex: 1, minWidth: 0 },
  userName: { ...T.label, color: A.mandirText },
  userRole: { ...T.small, fontSize: 12, color: A.mandirMuted },

  drawerScrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: A.overlay },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, maxWidth: '86%', backgroundColor: A.mandir },
  drawerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: S.sm },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.xl,
    paddingBottom: 10,
    backgroundColor: A.canvas,
    borderBottomWidth: 1,
    borderBottomColor: A.line,
  },
  topbarPhone: { paddingHorizontal: S.sm, gap: S.xs, backgroundColor: A.surface },
  topTitle: { flex: 1, minWidth: 0 },
  topTitleText: { ...T.h2, color: A.ink },
  searchButton: {
    flex: 1,
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    minHeight: 38,
    paddingHorizontal: S.md,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: A.line,
    backgroundColor: A.surface,
  },
  searchButtonHover: { borderColor: A.lineStrong, backgroundColor: A.hover },
  searchText: { ...T.body, color: A.subtle, flex: 1 },
  kbd: { ...T.mono, fontSize: 11, color: A.muted, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: A.sunken },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginLeft: 'auto' },
  changes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    minHeight: 36,
    paddingHorizontal: S.sm,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  changesText: { ...T.label, color: A.body },
  changesCount: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: A.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  changesCountText: { ...T.label, fontSize: 10.5, lineHeight: 13, color: A.onSaffron },

  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingVertical: S.sm,
    backgroundColor: A.saffron,
  },
  previewText: { ...T.label, color: A.onSaffron, flex: 1, minWidth: 180 },
  previewActions: { flexDirection: 'row', gap: S.sm },

  dock: {
    flexDirection: 'row',
    backgroundColor: A.surface,
    borderTopWidth: 1,
    borderTopColor: A.line,
    paddingTop: 6,
  },
  dockItem: { flex: 1, alignItems: 'center', gap: 2, minHeight: 44, justifyContent: 'center' },
  dockLabel: { ...T.small, fontSize: 11.5, lineHeight: 15, color: A.muted },
  dockLabelActive: { color: A.saffronInk, fontFamily: T.label.fontFamily },
  dockBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: A.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  dockBadgeText: { ...T.label, fontSize: 10, lineHeight: 12, color: A.onSaffron },

  noAccess: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xl },

  paletteBackdrop: { flex: 1, backgroundColor: A.overlay, alignItems: 'center', paddingTop: '10%', padding: S.lg },
  palette: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '80%',
    backgroundColor: A.surface,
    borderRadius: R.lg,
    overflow: 'hidden',
    ...lift,
  },
  palettePhone: { maxHeight: '92%' },
  paletteInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingLeft: S.lg,
    paddingRight: S.sm,
    paddingVertical: S.sm,
    borderBottomWidth: 1,
    borderBottomColor: A.line,
  },
  paletteText: { flex: 1, ...T.body, fontSize: 16, color: A.ink, paddingVertical: 8, outlineStyle: 'none' } as object,
  paletteResults: { padding: S.sm },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.sm + 2, borderRadius: R.md },
  paletteRowHover: { backgroundColor: A.hover },
  paletteIcon: {
    width: 32,
    height: 32,
    borderRadius: R.md,
    backgroundColor: A.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteRowText: { flex: 1, minWidth: 0 },
  paletteTitle: { ...T.label, color: A.ink },
  paletteDesc: { ...T.small, color: A.muted },
});
