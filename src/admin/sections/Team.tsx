import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PERMISSION_GROUPS, expand } from '../auth/rbac';
import { useAdmin, type AdminUser } from '../auth/store';
import { ago } from '../format';
import { Select, TextField } from '../ui/fields';
import { AIcon } from '../ui/icons';
import { Badge, Button, Grid, ListRow, Notice, Panel, Row } from '../ui/kit';
import { Sheet, useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { Avatar } from '../ui/Shell';
import { A, S, T } from '../ui/theme';

const COLORS = ['#E0692A', '#2E8B57', '#D6336C', '#1C7ED6', '#C9A227', '#0F8A8A', '#8A5A44', '#5C6B73'];

export default function Team() {
  const admin = useAdmin();
  const { users, roles, me, can } = admin;
  const { alert, confirm, toast } = useOverlay();
  const manage = can('team.manage');
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('editor');
  const [error, setError] = useState<string | null>(null);
  const [checkId, setCheckId] = useState(me?.id ?? '');

  const open = users.find((u) => u.id === openId) ?? null;
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;
  const roleOptions = roles
    .filter((r) => r.id !== 'owner' || me?.roleId === 'owner')
    .map((r) => ({ value: r.id, label: r.name, hint: r.description }));

  const invite = async () => {
    const result = admin.addUser({ name, email, roleId });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setName('');
    setEmail('');
    await alert({
      title: `${name.trim()} can sign in now`,
      body: `Give them this temporary password, in person or by a message only they can read. They choose their own the first time they sign in. It is not shown again.`,
      copyable: result.temporaryPassword,
    });
  };

  const checked = users.find((u) => u.id === checkId);
  const checkedRole = roles.find((r) => r.id === checked?.roleId);
  const granted = useMemo(() => (checkedRole ? expand(checkedRole.permissions) : new Set()), [checkedRole]);

  const act = (result: { ok: boolean; error?: string }, success: string) => {
    if (result.ok) toast(success);
    else toast((result as { error: string }).error, 'danger');
  };

  return (
    <AdminPage section="team" readOnlyNote="Your role can see the team but not change it." canEdit={manage}>
      <Grid min={420} max={2}>
        <Panel id="members" title="Team members" description="Everyone who can sign in to this dashboard on this device" icon="users" actions={<Badge label={`${users.length}`} />}>
          {users.map((user) => {
            const locked = user.lockedUntil > Date.now();
            return (
              <ListRow
                key={user.id}
                leading={<Avatar name={user.name} color={user.color} size={36} />}
                title={`${user.name}${user.id === me?.id ? ' (you)' : ''}`}
                subtitle={`${user.email} · last signed in ${ago(user.lastLoginAt)}`}
                onPress={() => setOpenId(user.id)}
                trailing={
                  <Row gap={4}>
                    {user.status === 'suspended' ? <Badge label="Suspended" tone="danger" /> : null}
                    {locked ? <Badge label="Locked" tone="warning" icon="lock" /> : null}
                    {user.mustChangePassword ? <Badge label="New" tone="info" /> : null}
                    <Badge label={roleName(user.roleId)} tone={user.roleId === 'owner' ? 'brand' : 'neutral'} />
                  </Row>
                }
              />
            );
          })}
        </Panel>

        <Panel id="invite" title="Add someone" description="They get a temporary password, and choose their own when they first sign in" icon="plus">
          {manage ? (
            <>
              <TextField label="Name" value={name} onChange={setName} autoCapitalize="words" />
              <TextField label="Email" value={email} onChange={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Select label="Role" value={roleId} options={roleOptions} onChange={setRoleId} />
              {error ? <Notice tone="danger">{error}</Notice> : null}
              <Button label="Add to the team" icon="plus" variant="primary" onPress={invite} disabled={!name.trim() || !email.trim()} />
            </>
          ) : (
            <Notice tone="info">Only people who manage the team can add someone.</Notice>
          )}
        </Panel>

        <Panel id="access-check" title="What can they do?" description="One person’s permissions, in plain words" icon="shield">
          <Select alwaysEditable label="Person" value={checkId} options={users.map((u) => ({ value: u.id, label: u.name, hint: roleName(u.roleId) }))} onChange={setCheckId} />
          {checked && checkedRole ? (
            <View style={styles.access}>
              {PERMISSION_GROUPS.map((group) => {
                const allowed = group.permissions.filter((p) => granted.has(p.id));
                return (
                  <View key={group.id} style={styles.accessRow}>
                    <AIcon name={allowed.length ? 'check' : 'minus'} size={16} color={allowed.length ? A.green : A.subtle} strokeWidth={2.2} />
                    <Text style={[styles.accessLabel, !allowed.length && styles.accessOff]}>{group.label}</Text>
                    <Text style={styles.accessWhat}>{allowed.length ? allowed.map((p) => p.label).join(', ') : 'No access'}</Text>
                  </View>
                );
              })}
              {checked.status === 'suspended' ? <Notice tone="danger">Suspended: none of this applies until the account is restored.</Notice> : null}
            </View>
          ) : null}
        </Panel>
      </Grid>

      <Sheet
        visible={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name ?? ''}
        subtitle={open ? `${open.email} · added ${ago(open.createdAt)} by ${open.createdBy}` : ''}
        width={560}
        footer={<Button label="Done" variant="primary" onPress={() => setOpenId(null)} />}
      >
        {open ? (
          <MemberEditor
            user={open}
            manage={manage}
            isMe={open.id === me?.id}
            roleOptions={roleOptions}
            onSave={(patch, success) => act(admin.updateUser(open.id, patch), success)}
            onReset={async () => {
              const ok = await confirm({ title: `Reset ${open.name}’s password?`, body: 'Their current password stops working at once.', confirmLabel: 'Reset password', destructive: true });
              if (!ok) return;
              const result = admin.resetPassword(open.id);
              if (!result.ok) return toast(result.error, 'danger');
              await alert({ title: 'New temporary password', body: 'Give it to them privately. They choose their own when they sign in.', copyable: result.temporaryPassword });
            }}
            onStatus={async (status) => {
              if (status === 'suspended') {
                const ok = await confirm({ title: `Suspend ${open.name}?`, body: 'They are signed out and cannot sign in until restored.', confirmLabel: 'Suspend', destructive: true });
                if (!ok) return;
              }
              act(admin.setUserStatus(open.id, status), status === 'suspended' ? 'Account suspended' : 'Account restored');
            }}
            onUnlock={() => {
              admin.unlockUser(open.id);
              toast('Unlocked');
            }}
            onRemove={async () => {
              const ok = await confirm({ title: `Remove ${open.name} from the team?`, body: 'Their account is deleted. Their entries in the activity log stay.', confirmLabel: 'Remove', destructive: true });
              if (!ok) return;
              const result = admin.removeUser(open.id);
              act(result, 'Removed from the team');
              if (result.ok) setOpenId(null);
            }}
          />
        ) : null}
      </Sheet>
    </AdminPage>
  );
}

function MemberEditor({
  user,
  manage,
  isMe,
  roleOptions,
  onSave,
  onReset,
  onStatus,
  onUnlock,
  onRemove,
}: {
  user: AdminUser;
  manage: boolean;
  isMe: boolean;
  roleOptions: { value: string; label: string; hint?: string }[];
  onSave: (patch: Partial<Pick<AdminUser, 'name' | 'email' | 'roleId' | 'note' | 'color'>>, success: string) => void;
  onReset: () => void;
  onStatus: (status: AdminUser['status']) => void;
  onUnlock: () => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [note, setNote] = useState(user.note);
  const locked = user.lockedUntil > Date.now();

  return (
    <>
      <TextField label="Name" value={name} onChange={setName} />
      <TextField label="Email" value={email} onChange={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextField label="Note" value={note} onChange={setNote} placeholder="What they look after" />
      {manage ? <Button label="Save details" size="sm" onPress={() => onSave({ name, email, note }, 'Details saved')} /> : null}
      <Select
        label="Role"
        value={user.roleId}
        options={roleOptions}
        onChange={(roleId) => onSave({ roleId }, 'Role changed')}
        hint={isMe ? 'You cannot change your own role.' : undefined}
      />
      {manage ? (
        <Row gap={6} wrap>
          {COLORS.map((color) => (
            <Text
              key={color}
              accessibilityRole="button"
              accessibilityLabel={`Colour ${color}`}
              onPress={() => onSave({ color }, 'Colour changed')}
              style={[styles.color, { backgroundColor: color }, user.color === color && styles.colorOn]}
            />
          ))}
        </Row>
      ) : null}
      {manage && !isMe ? (
        <View style={styles.actions}>
          <Button label="Reset password" icon="key" onPress={onReset} />
          {locked ? <Button label="Unlock" icon="lock" onPress={onUnlock} /> : null}
          {user.status === 'active' ? (
            <Button label="Suspend" icon="stop" onPress={() => onStatus('suspended')} />
          ) : (
            <Button label="Restore" icon="refresh" onPress={() => onStatus('active')} />
          )}
          <Button label="Remove from team" icon="trash" variant="danger" onPress={onRemove} />
        </View>
      ) : null}
      {isMe ? <Notice tone="info">Change your own password under Your account.</Notice> : null}
    </>
  );
}

const styles = StyleSheet.create({
  access: { gap: 2 },
  accessRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingVertical: 4 },
  accessLabel: { ...T.label, color: A.ink, width: 150 },
  accessOff: { color: A.subtle },
  accessWhat: { ...T.small, color: A.muted, flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginTop: S.sm },
  color: { width: 28, height: 28, borderRadius: 14, overflow: 'hidden' },
  colorOn: { borderWidth: 3, borderColor: A.ink },
});
