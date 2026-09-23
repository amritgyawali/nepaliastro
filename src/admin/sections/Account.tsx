import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PERMISSION_GROUPS, expand } from '../auth/rbac';
import { useAdmin } from '../auth/store';
import { ago } from '../format';
import { TextField } from '../ui/fields';
import { AIcon } from '../ui/icons';
import { Badge, Button, Grid, KeyValue, Notice, Panel, Row } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { Avatar } from '../ui/Shell';
import { A, R, S, T } from '../ui/theme';

const COLORS = ['#E0692A', '#2E8B57', '#D6336C', '#1C7ED6', '#C9A227', '#0F8A8A', '#8A5A44', '#5C6B73'];

export default function Account() {
  const { me, myRole, session, policy, updateMe, changeMyPassword, signOut } = useAdmin();
  const { toast } = useOverlay();
  const [name, setName] = useState(me?.name ?? '');
  const [email, setEmail] = useState(me?.email ?? '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!me) return null;
  const granted = expand(myRole?.permissions ?? []);

  return (
    <AdminPage section="account" title={me.name} description={`${myRole?.name ?? 'No role'} · ${me.email}`}>
      <Grid min={400} max={2}>
        <Panel id="my-profile" title="Your details" icon="user">
          <Row gap={S.md}>
            <Avatar name={name || me.name} color={me.color} size={56} />
            <View style={styles.flex}>
              <Text style={styles.name}>{me.name}</Text>
              <Text style={styles.meta}>Signed in {ago(session?.startedAt ?? 0)}</Text>
            </View>
          </Row>
          <TextField label="Name" value={name} onChange={setName} alwaysEditable autoCapitalize="words" />
          <TextField label="Email" value={email} onChange={setEmail} alwaysEditable keyboardType="email-address" autoCapitalize="none" hint="You sign in with this." />
          <Row gap={6} wrap>
            {COLORS.map((color) => (
              <Pressable
                key={color}
                accessibilityRole="button"
                accessibilityLabel={`Use colour ${color}`}
                onPress={() => updateMe({ color })}
                style={[styles.swatch, { backgroundColor: color }, me.color === color && styles.swatchOn]}
              />
            ))}
          </Row>
          <Button
            label="Save details"
            variant="primary"
            disabled={name === me.name && email === me.email}
            onPress={() => {
              const result = updateMe({ name, email });
              toast(result.ok ? 'Details saved' : result.error, result.ok ? 'success' : 'danger');
            }}
          />
        </Panel>

        <Panel id="my-password" title="Change your password" icon="key">
          <TextField label="Current password" value={current} onChange={setCurrent} secure alwaysEditable />
          <TextField
            label="New password"
            value={next}
            onChange={setNext}
            secure
            alwaysEditable
            hint={`At least ${policy.minPasswordLength} characters${policy.requireNumber ? ', a number' : ''}${policy.requireSymbol ? ', a symbol' : ''}.`}
          />
          <TextField label="New password again" value={again} onChange={setAgain} secure alwaysEditable />
          {error ? <Notice tone="danger">{error}</Notice> : null}
          <Button
            label="Change password"
            variant="primary"
            disabled={!current || !next}
            onPress={() => {
              if (next !== again) return setError('The two new passwords are different.');
              const result = changeMyPassword(current, next);
              if (!result.ok) return setError(result.error);
              setError(null);
              setCurrent('');
              setNext('');
              setAgain('');
              toast('Password changed');
            }}
          />
        </Panel>

        <Panel id="my-permissions" title="What you can do" description={myRole?.description} icon="shield" actions={myRole ? <Badge label={myRole.name} tone="brand" /> : undefined}>
          {PERMISSION_GROUPS.map((group) => {
            const allowed = group.permissions.filter((p) => granted.has(p.id));
            return (
              <View key={group.id} style={styles.permRow}>
                <AIcon name={allowed.length ? 'check' : 'minus'} size={16} color={allowed.length ? A.green : A.subtle} strokeWidth={2.2} />
                <Text style={[styles.permLabel, !allowed.length && styles.off]}>{group.label}</Text>
                <Text style={styles.permWhat}>{allowed.length ? allowed.map((p) => p.label).join(', ') : '—'}</Text>
              </View>
            );
          })}
        </Panel>

        <Panel id="sign-out" title="Sign out" description="Leaves the dashboard on this device. The app itself keeps running." icon="logout">
          <KeyValue
            rows={[
              { label: 'Locks itself after', value: policy.autoLockMinutes ? `${policy.autoLockMinutes} idle minutes` : 'Never' },
              { label: 'Account created', value: ago(me.createdAt) },
            ]}
          />
          <Button label="Sign out now" icon="logout" variant="danger" onPress={() => signOut()} />
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  name: { ...T.h2, color: A.ink },
  meta: { ...T.small, color: A.muted },
  swatch: { width: 28, height: 28, borderRadius: R.pill },
  swatchOn: { borderWidth: 3, borderColor: A.ink },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingVertical: 3 },
  permLabel: { ...T.label, color: A.ink, width: 150 },
  off: { color: A.subtle },
  permWhat: { ...T.small, color: A.muted, flex: 1 },
});
