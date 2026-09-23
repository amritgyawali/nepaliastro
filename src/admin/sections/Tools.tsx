import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from 'react-native';

import { useAdmin } from '../auth/store';
import { SECTIONS } from '../nav';
import { TOOLS, searchTools } from '../tools';
import { useColumns } from '../ui/context';
import { TextField } from '../ui/fields';
import { AIcon } from '../ui/icons';
import { Badge, EmptyState, Panel } from '../ui/kit';
import { AdminPage } from '../ui/Page';
import { go } from '../ui/Shell';
import { A, R, S, T } from '../ui/theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

export default function Tools() {
  const router = useRouter();
  const { can } = useAdmin();
  const [query, setQuery] = useState('');
  const columns = useColumns(300, 3);

  const allowed = useMemo(
    () => SECTIONS.filter((section) => !section.permission || can(section.permission)),
    [can],
  );
  const results = useMemo(() => {
    const ids = new Set(allowed.map((s) => s.id));
    return searchTools(query).filter((tool) => ids.has(tool.section));
  }, [allowed, query]);
  const total = TOOLS.filter((tool) => allowed.some((s) => s.id === tool.section)).length;

  return (
    <AdminPage
      section="tools"
      description={`${total} tools across ${allowed.length} sections. Search by what you want to change.`}
    >
      <Panel id="command-palette" padded>
        <TextField
          value={query}
          onChange={setQuery}
          placeholder="Try “logo”, “price”, “dark”, “banner”…"
          icon="search"
          alwaysEditable
          accessibilityLabel="Search tools"
        />
      </Panel>

      {allowed.map((section) => {
        const tools = results.filter((tool) => tool.section === section.id);
        if (!tools.length) return null;
        return (
          <View key={section.id} style={styles.group}>
            <View style={styles.groupHead}>
              <AIcon name={section.icon} size={18} color={A.saffronInk} />
              <Text style={styles.groupTitle}>{section.label}</Text>
              <Text style={styles.groupNp}>{section.np}</Text>
              <Badge label={String(tools.length)} />
            </View>
            <View style={styles.cards}>
              {tools.map((tool) => (
                <Pressable
                  key={tool.id}
                  accessibilityRole="button"
                  accessibilityLabel={tool.title}
                  onPress={() => go(router, `${section.href}?tool=${tool.id}`)}
                  style={(state) => [
                    styles.card,
                    { width: `${100 / columns}%` as `${number}%` },
                  ]}
                >
                  {(state) => (
                    <View style={[styles.cardInner, ((state as Interaction).hovered || state.pressed) && styles.cardHover]}>
                      <Text style={styles.cardTitle}>{tool.title}</Text>
                      <Text style={styles.cardBody} numberOfLines={2}>
                        {tool.description}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      {!results.length ? (
        <EmptyState icon="search" title={`No tool matches “${query}”`} body="Try a shorter or more general word." />
      ) : null}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  group: { gap: S.sm },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: 2 },
  groupTitle: { ...T.h2, color: A.ink },
  groupNp: { ...T.small, color: A.muted, flex: 1 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -S.xs },
  card: { padding: S.xs },
  cardInner: {
    flex: 1,
    minHeight: 78,
    backgroundColor: A.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: A.line,
    padding: S.md,
    gap: 3,
  },
  cardHover: { borderColor: A.saffron, backgroundColor: A.hover },
  cardTitle: { ...T.label, color: A.ink },
  cardBody: { ...T.small, color: A.muted },
});
