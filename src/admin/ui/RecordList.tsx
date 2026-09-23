import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from 'react-native';

import type { ImageRef } from '@/config/schema';

import { move } from '../editor';
import { useCanEdit } from './context';
import { TextField } from './fields';
import { AIcon } from './icons';
import { Badge, Button, EmptyState, IconButton } from './kit';
import { Sheet, useOverlay } from './overlay';
import { ImageThumb } from './pickers';
import { A, R, S, T, type AdminTone } from './theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

/**
 * A list of records — services, astrologers, remedies, banners — with the
 * same controls everywhere: search, move up and down, show or hide, copy,
 * delete, and a sheet to edit one in full. On a phone the sheet covers the
 * screen; on a computer it opens over the list.
 */
export function RecordList<T>({
  items,
  onChange,
  getId,
  getTitle,
  getSubtitle,
  getImage,
  getBadges,
  isHidden,
  setHidden,
  create,
  duplicate,
  addLabel = 'Add',
  renderEditor,
  canDelete = () => true,
  deleteLabel = 'Delete',
  searchText,
  noun = 'item',
  emptyBody,
  reorderable = true,
  roundImage,
  leading,
}: {
  items: T[];
  onChange: (items: T[], what: string) => void;
  getId: (item: T) => string;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getImage?: (item: T) => ImageRef;
  getBadges?: (item: T) => { label: string; tone?: AdminTone }[];
  isHidden?: (item: T) => boolean;
  setHidden?: (item: T, hidden: boolean) => T;
  create?: () => T;
  duplicate?: (item: T) => T;
  addLabel?: string;
  renderEditor: (item: T, set: (next: T) => void) => React.ReactNode;
  canDelete?: (item: T) => boolean;
  deleteLabel?: string;
  searchText?: (item: T) => string;
  noun?: string;
  emptyBody?: string;
  reorderable?: boolean;
  roundImage?: boolean;
  leading?: (item: T) => React.ReactNode;
}) {
  const canEdit = useCanEdit();
  const { confirm } = useOverlay();
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const open = items.find((item) => getId(item) === openId) ?? null;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      (searchText ? searchText(item) : `${getTitle(item)} ${getSubtitle?.(item) ?? ''}`).toLowerCase().includes(needle),
    );
  }, [getSubtitle, getTitle, items, query, searchText]);
  const searching = query.trim().length > 0;

  const replace = (next: T, what: string) =>
    onChange(
      items.map((item) => (getId(item) === getId(next) ? next : item)),
      what,
    );

  const remove = async (item: T) => {
    const ok = await confirm({
      title: `${deleteLabel} “${getTitle(item) || `this ${noun}`}”?`,
      body: `It goes from the draft now, and from the app when you publish.`,
      confirmLabel: deleteLabel,
      destructive: true,
    });
    if (!ok) return;
    setOpenId(null);
    onChange(
      items.filter((candidate) => getId(candidate) !== getId(item)),
      `removed ${getTitle(item)}`,
    );
  };

  const add = () => {
    if (!create) return;
    const item = create();
    onChange([...items, item], `added a ${noun}`);
    setOpenId(getId(item));
  };

  return (
    <View style={styles.root}>
      {items.length > 6 ? (
        <TextField value={query} onChange={setQuery} placeholder={`Search ${items.length} ${noun}s`} icon="search" alwaysEditable />
      ) : null}

      <View style={styles.list}>
        {filtered.map((item) => {
          const index = items.indexOf(item);
          const hidden = isHidden?.(item) ?? false;
          const id = getId(item);
          // The row's body and its controls are siblings, not one inside the
          // other: web would otherwise render a button inside a button.
          return (
            <View key={id} style={[styles.row, hidden && styles.rowHidden]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${getTitle(item)}`}
              onPress={() => setOpenId(id)}
              style={(state) => [
                styles.rowBody,
                ((state as Interaction).hovered || state.pressed) && styles.rowHover,
              ]}
            >
              {leading ? leading(item) : getImage ? <ImageThumb image={getImage(item)} size={42} round={roundImage} /> : null}
              <View style={styles.rowText}>
                <View style={styles.rowTitleLine}>
                  <Text style={[styles.rowTitle, hidden && styles.rowTitleHidden]} numberOfLines={1}>
                    {getTitle(item) || `Untitled ${noun}`}
                  </Text>
                  {hidden ? <Badge label="Hidden" tone="neutral" icon="eyeOff" /> : null}
                  {getBadges?.(item).map((badge) => <Badge key={badge.label} label={badge.label} tone={badge.tone} />)}
                </View>
                {getSubtitle ? (
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {getSubtitle(item)}
                  </Text>
                ) : null}
              </View>
              {!canEdit ? <AIcon name="right" size={16} color={A.subtle} /> : null}
            </Pressable>
              {canEdit ? (
                <View style={styles.rowActions}>
                  {setHidden ? (
                    <IconButton
                      icon={hidden ? 'eyeOff' : 'eye'}
                      label={hidden ? 'Show' : 'Hide'}
                      size={32}
                      onPress={() => replace(setHidden(item, !hidden), `${hidden ? 'showed' : 'hid'} ${getTitle(item)}`)}
                    />
                  ) : null}
                  {reorderable && !searching ? (
                    <>
                      <IconButton icon="up" label="Move up" size={32} disabled={index === 0} onPress={() => onChange(move(items, index, -1), `moved ${getTitle(item)}`)} />
                      <IconButton icon="down" label="Move down" size={32} disabled={index === items.length - 1} onPress={() => onChange(move(items, index, 1), `moved ${getTitle(item)}`)} />
                    </>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })}
        {!filtered.length ? (
          <EmptyState
            icon="layers"
            title={searching ? `No ${noun} matches “${query}”` : `No ${noun}s yet`}
            body={searching ? undefined : emptyBody}
          />
        ) : null}
      </View>

      {create && canEdit ? <Button label={addLabel} icon="plus" onPress={add} style={styles.add} /> : null}

      <Sheet
        visible={!!open}
        onClose={() => setOpenId(null)}
        title={open ? getTitle(open) || `New ${noun}` : ''}
        subtitle={canEdit ? 'Changes go into the draft as you type.' : 'You can view this, not change it.'}
        width={620}
        footer={
          open ? (
            <>
              {canEdit && duplicate ? (
                <Button
                  label="Duplicate"
                  icon="copy"
                  onPress={() => {
                    const copy = duplicate(open);
                    const at = items.indexOf(open);
                    const next = [...items.slice(0, at + 1), copy, ...items.slice(at + 1)];
                    onChange(next, `duplicated ${getTitle(open)}`);
                    setOpenId(getId(copy));
                  }}
                />
              ) : null}
              {canEdit && canDelete(open) ? (
                <Button label={deleteLabel} icon="trash" variant="ghost" onPress={() => remove(open)} />
              ) : null}
              <View style={styles.spacer} />
              <Button label="Done" variant="primary" onPress={() => setOpenId(null)} />
            </>
          ) : undefined
        }
      >
        {open ? renderEditor(open, (next) => replace(next, `edited ${getTitle(next)}`)) : null}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: S.md },
  list: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rowBody: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.sm,
    paddingHorizontal: S.sm,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowHover: { backgroundColor: A.hover, borderColor: A.line },
  rowHidden: { opacity: 0.65 },
  rowText: { flex: 1, minWidth: 0, gap: 1 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rowTitle: { ...T.label, color: A.ink, flexShrink: 1 },
  rowTitleHidden: { color: A.muted },
  rowSubtitle: { ...T.small, color: A.muted },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
  add: { alignSelf: 'flex-start' },
  spacer: { flex: 1 },
});
