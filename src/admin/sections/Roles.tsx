import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PERMISSION_GROUPS, expand, type Permission, type Role } from '../auth/rbac';
import { randomHex } from '../auth/crypto';
import { useAdmin } from '../auth/store';
import { Select, TextField } from '../ui/fields';
import { AIcon } from '../ui/icons';
import { Badge, Button, Dot, Grid, IconButton, ListRow, Notice, Panel, Row } from '../ui/kit';
import { Sheet, useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { A, R, S, T } from '../ui/theme';

const ALL_ROWS = PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((p) => ({ group: group.label, id: p.id, label: p.label })),
);

export default function Roles() {
  const { roles, users, can, saveRole, removeRole } = useAdmin();
  const { confirm, prompt, toast } = useOverlay();
  const manage = can('roles.manage');
  const [editing, setEditing] = useState<string | null>(null);
  const [left, setLeft] = useState('designer');
  const [right, setRight] = useState('editor');

  const editRole = roles.find((r) => r.id === editing) ?? null;
  const holders = (id: string) => users.filter((u) => u.roleId === id).length;

  const duplicate = async (role: Role) => {
    const name = await prompt({
      title: `A new role based on ${role.name}`,
      label: 'Name',
      initial: `${role.name} (custom)`,
      confirmLabel: 'Create role',
      validate: (value) => (value.trim() ? null : 'Give it a name.'),
    });
    if (!name) return;
    const copy: Role = { ...role, id: `role-${randomHex(4)}`, name: name.trim(), builtIn: false, permissions: [...role.permissions] };
    const result = saveRole(copy);
    if (result.ok) {
      toast('Role created');
      setEditing(copy.id);
    } else toast(result.error, 'danger');
  };

  const toggle = (role: Role, permission: Permission) => {
    if (role.builtIn || !manage) return;
    const has = role.permissions.includes(permission);
    const result = saveRole({ ...role, permissions: has ? role.permissions.filter((p) => p !== permission) : [...role.permissions, permission] });
    if (!result.ok) toast(result.error, 'danger');
  };

  const a = roles.find((r) => r.id === left);
  const b = roles.find((r) => r.id === right);
  const aSet = a ? expand(a.permissions) : new Set<Permission>();
  const bSet = b ? expand(b.permissions) : new Set<Permission>();

  return (
    <AdminPage section="roles" canEdit={manage} readOnlyNote="Only an owner can change what roles allow.">
      <Panel id="role-list" title="Roles" description="The seven built-in roles cannot be changed, but any of them can be copied into a role of your own." icon="key">
        {roles.map((role) => (
          <ListRow
            key={role.id}
            leading={<Dot color={role.color} size={12} />}
            title={role.name}
            subtitle={role.description}
            onPress={role.builtIn ? undefined : () => setEditing(role.id)}
            trailing={
              <Row gap={4}>
                <Badge label={`${holders(role.id)} ${holders(role.id) === 1 ? 'person' : 'people'}`} />
                {role.builtIn ? <Badge label="Built in" tone="neutral" icon="lock" /> : <Badge label="Custom" tone="brand" />}
                {manage ? <IconButton icon="copy" label={`Copy ${role.name}`} size={32} onPress={() => duplicate(role)} /> : null}
              </Row>
            }
          />
        ))}
      </Panel>

      <Panel id="permission-matrix" title="Permissions" description="A tick means the role may do it. Tick boxes in a custom role’s column to change it." icon="shield">
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={styles.matrixRow}>
              <View style={styles.matrixLabel} />
              {roles.map((role) => (
                <View key={role.id} style={styles.matrixHead}>
                  <Dot color={role.color} />
                  <Text style={styles.matrixHeadText} numberOfLines={2}>
                    {role.name}
                  </Text>
                </View>
              ))}
            </View>
            {ALL_ROWS.map((row, index) => (
              <View key={row.id} style={[styles.matrixRow, index % 2 === 1 && styles.matrixStripe]}>
                <View style={styles.matrixLabel}>
                  <Text style={styles.matrixGroup} numberOfLines={1}>
                    {row.group}
                  </Text>
                  <Text style={styles.matrixPerm}>{row.label}</Text>
                </View>
                {roles.map((role) => {
                  const on = role.permissions.includes(row.id);
                  const implied = !on && expand(role.permissions).has(row.id);
                  const live = !role.builtIn && manage;
                  return (
                    <Pressable
                      key={role.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on || implied, disabled: !live }}
                      accessibilityLabel={`${role.name}: ${row.group}, ${row.label}`}
                      disabled={!live}
                      onPress={() => toggle(role, row.id)}
                      style={styles.matrixCell}
                    >
                      <View style={[styles.box, (on || implied) && styles.boxOn, implied && styles.boxImplied, !live && styles.boxLocked]}>
                        {on || implied ? <AIcon name="check" size={13} color={implied ? A.saffronInk : A.onSaffron} strokeWidth={3} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        <Text style={styles.legend}>A pale tick is implied: editing something includes viewing it.</Text>
      </Panel>

      <Grid min={420} max={2}>
        <Panel id="role-compare" title="Compare roles" description="What one role can do that the other cannot" icon="split">
          <Row gap={S.md} wrap>
            <View style={styles.half}>
              <Select alwaysEditable label="This role" value={left} options={roles.map((r) => ({ value: r.id, label: r.name }))} onChange={setLeft} />
            </View>
            <View style={styles.half}>
              <Select alwaysEditable label="Against" value={right} options={roles.map((r) => ({ value: r.id, label: r.name }))} onChange={setRight} />
            </View>
          </Row>
          {a && b ? (
            <View style={styles.compare}>
              {ALL_ROWS.filter((row) => aSet.has(row.id) !== bSet.has(row.id)).map((row) => (
                <View key={row.id} style={styles.compareRow}>
                  <Text style={styles.compareWhat}>
                    {row.group} · {row.label}
                  </Text>
                  <Badge label={aSet.has(row.id) ? `Only ${a.name}` : `Only ${b.name}`} tone={aSet.has(row.id) ? 'brand' : 'info'} />
                </View>
              ))}
              {ALL_ROWS.every((row) => aSet.has(row.id) === bSet.has(row.id)) ? <Notice tone="info">These two roles allow exactly the same things.</Notice> : null}
            </View>
          ) : null}
        </Panel>
      </Grid>

      <Sheet
        visible={!!editRole}
        onClose={() => setEditing(null)}
        title={editRole?.name ?? ''}
        subtitle="A custom role"
        width={520}
        footer={
          editRole ? (
            <>
              {manage ? (
                <Button
                  label="Delete role"
                  icon="trash"
                  variant="ghost"
                  onPress={async () => {
                    const count = holders(editRole.id);
                    const ok = await confirm({
                      title: `Delete ${editRole.name}?`,
                      body: count ? `${count} ${count === 1 ? 'person holds' : 'people hold'} it; they become Viewers.` : 'Nobody holds it.',
                      confirmLabel: 'Delete role',
                      destructive: true,
                    });
                    if (!ok) return;
                    const result = removeRole(editRole.id);
                    if (result.ok) setEditing(null);
                    else toast(result.error, 'danger');
                  }}
                />
              ) : null}
              <View style={styles.flex} />
              <Button label="Done" variant="primary" onPress={() => setEditing(null)} />
            </>
          ) : undefined
        }
      >
        {editRole ? (
          <>
            <TextField label="Name" value={editRole.name} onChange={(name) => saveRole({ ...editRole, name })} maxLength={40} />
            <TextField label="What it is for" value={editRole.description} multiline rows={2} onChange={(description) => saveRole({ ...editRole, description })} />
            <Row gap={6} wrap>
              {['#E0692A', '#2E8B57', '#D6336C', '#1C7ED6', '#C9A227', '#0F8A8A', '#8A5A44', '#868E96'].map((color) => (
                <Pressable
                  key={color}
                  accessibilityRole="button"
                  accessibilityLabel={`Colour ${color}`}
                  disabled={!manage}
                  onPress={() => saveRole({ ...editRole, color })}
                  style={[styles.swatch, { backgroundColor: color }, editRole.color === color && styles.swatchOn]}
                />
              ))}
            </Row>
            <Text style={styles.legend}>Tick its permissions in the matrix.</Text>
          </>
        ) : null}
      </Sheet>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  half: { flex: 1, minWidth: 160 },
  matrixRow: { flexDirection: 'row', alignItems: 'center' },
  matrixStripe: { backgroundColor: A.hover },
  matrixLabel: { width: 190, paddingVertical: 6, paddingRight: S.md },
  matrixGroup: { ...T.small, fontSize: 11.5, color: A.subtle },
  matrixPerm: { ...T.label, color: A.ink },
  matrixHead: { width: 88, alignItems: 'center', gap: 4, paddingBottom: S.sm },
  matrixHeadText: { ...T.small, fontSize: 11.5, lineHeight: 14, color: A.body, textAlign: 'center' },
  matrixCell: { width: 88, height: 40, alignItems: 'center', justifyContent: 'center' },
  box: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: A.lineStrong, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: A.saffron, borderColor: A.saffron },
  boxImplied: { backgroundColor: A.saffronSoft, borderColor: A.saffronSoft },
  boxLocked: { opacity: 0.75 },
  legend: { ...T.small, color: A.muted },
  compare: { gap: 4 },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.md, paddingVertical: 4 },
  compareWhat: { ...T.label, color: A.ink, flex: 1 },
  swatch: { width: 28, height: 28, borderRadius: R.pill },
  swatchOn: { borderWidth: 3, borderColor: A.ink },
});
