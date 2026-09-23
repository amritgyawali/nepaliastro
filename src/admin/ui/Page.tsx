import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAdmin } from '../auth/store';
import { sectionById, type SectionId } from '../nav';
import { AnchorProvider, EditScope, useContentWidth } from './context';
import { Badge } from './kit';
import { NoAccess } from './Shell';
import { A, BREAKPOINTS, CONTENT_MAX, S, T } from './theme';

/**
 * The frame for one section: its Nepali name, its title, a line on what it
 * is for, and the section's panels below.
 *
 * Opening a tool (`?tool=brand-color`) scrolls its panel into view and
 * marks it. A section whose edit permission the person lacks renders
 * read-only, with a note saying so.
 */
export function AdminPage({
  section,
  title,
  description,
  actions,
  children,
  canEdit,
  readOnlyNote,
}: {
  section: SectionId;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Whether the controls on this page are live. Defaults to on. */
  canEdit?: boolean;
  readOnlyNote?: string;
}) {
  const meta = sectionById(section);
  const { tool } = useLocalSearchParams<{ tool?: string }>();
  const { myRole, can } = useAdmin();
  const scroll = useRef<ScrollView>(null);
  const content = useRef<View>(null);
  const nodes = useRef(new Map<string, React.RefObject<unknown>>());
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const width = useContentWidth();
  const insets = useSafeAreaInsets();
  const phone = width < BREAKPOINTS.tablet - 40;

  const register = useCallback((id: string, node: React.RefObject<unknown>) => {
    nodes.current.set(id, node);
    return () => {
      if (nodes.current.get(id) === node) nodes.current.delete(id);
    };
  }, []);

  // Scroll to the requested tool once the page has laid out.
  useEffect(() => {
    if (!tool) return;
    const timer = setTimeout(() => {
      setHighlighted(tool);
      if (Platform.OS === 'web') {
        const element = (globalThis as { document?: { getElementById: (id: string) => { scrollIntoView: (o: object) => void } | null } }).document?.getElementById(`tool-${tool}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const node = nodes.current.get(tool)?.current as { measureLayout?: Function } | null;
      if (node?.measureLayout && content.current) {
        node.measureLayout(
          content.current,
          (_x: number, y: number) => scroll.current?.scrollTo({ y: Math.max(0, y - S.md), animated: true }),
          () => {},
        );
      }
    }, 280);
    const clear = setTimeout(() => setHighlighted(null), 3200);
    return () => {
      clearTimeout(timer);
      clearTimeout(clear);
    };
  }, [tool]);

  const anchors = useMemo(() => ({ register, highlighted }), [register, highlighted]);
  const editable = canEdit ?? true;

  if (meta.permission && !can(meta.permission)) return <NoAccess section={meta} />;

  return (
    <AnchorProvider value={anchors}>
      <EditScope canEdit={editable}>
        <ScrollView
          ref={scroll}
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            phone && styles.contentPhone,
            { paddingBottom: S.xxl * 2 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View ref={content} style={styles.inner} collapsable={false}>
            <View style={[styles.head, phone && styles.headPhone]}>
              <View style={styles.titles}>
                <Text style={styles.np}>{meta.np}</Text>
                <Text style={[styles.title, phone && styles.titlePhone]}>{title ?? meta.label}</Text>
                <Text style={styles.description}>{description ?? meta.description}</Text>
              </View>
              {actions ? <View style={styles.actions}>{actions}</View> : null}
            </View>

            {!editable ? (
              <View style={styles.readOnly}>
                <Badge label="View only" tone="neutral" icon="eye" />
                <Text style={styles.readOnlyText}>
                  {readOnlyNote ??
                    `Your role${myRole ? `, ${myRole.name},` : ''} can look at this section but not change it.`}
                </Text>
              </View>
            ) : null}

            <View style={styles.body}>{children}</View>
          </View>
        </ScrollView>
      </EditScope>
    </AnchorProvider>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.xl, paddingTop: S.xl },
  contentPhone: { paddingHorizontal: S.lg, paddingTop: S.lg },
  inner: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: S.lg,
    marginBottom: S.xl,
  },
  headPhone: { marginBottom: S.lg },
  titles: { flexShrink: 1, minWidth: 240, gap: 2 },
  np: { ...T.label, color: A.saffronInk },
  title: { ...T.display, fontSize: 30, lineHeight: 36, color: A.ink },
  titlePhone: { fontSize: 25, lineHeight: 31 },
  description: { ...T.body, color: A.muted, maxWidth: 640 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: S.sm,
    padding: S.md,
    borderRadius: 10,
    backgroundColor: A.sunken,
    marginBottom: S.lg,
  },
  readOnlyText: { ...T.small, color: A.body, flexShrink: 1 },
  body: { gap: S.lg },
});
