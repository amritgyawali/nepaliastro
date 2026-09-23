import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppConfig } from '@/config/store';

import { useAdmin } from './auth/store';
import { TextField } from './ui/fields';
import { Button, Notice } from './ui/kit';
import { KundliMark } from './ui/Kundli';
import { Frame } from './ui/Shell';
import { A, BREAKPOINTS, R, S, T } from './ui/theme';

/**
 * What stands in front of the dashboard: the first-run owner setup, the
 * sign-in form, and the forced password change after a temporary password.
 * Only once all three are satisfied does the frame and its sections render.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { hydrated, hasOwner, me } = useAdmin();
  const { ready } = useAppConfig();

  if (!hydrated || !ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={A.brass} />
      </View>
    );
  }
  if (!hasOwner) return <Setup />;
  if (!me) return <SignIn />;
  if (me.mustChangePassword) return <FirstPassword />;
  return <Frame>{children}</Frame>;
}

function Split({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { live } = useAppConfig();
  const wide = width >= BREAKPOINTS.tablet + 80;

  const hero = (
    <View style={[styles.hero, wide ? styles.heroWide : { paddingTop: insets.top + S.xl }]}>
      <KundliMark size={wide ? 132 : 64} line={A.brass} />
      <View style={wide ? styles.heroTextWide : styles.heroText}>
        <Text style={styles.heroEyebrow}>नियन्त्रण कक्ष · Control room</Text>
        <Text style={[styles.heroTitle, !wide && styles.heroTitlePhone]}>{live.branding.appName}</Text>
        {wide ? (
          <Text style={styles.heroBody}>
            Change anything in the app — its colours, its words, its screens — in a draft, and send it
            live when it is ready.
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={[styles.split, wide && styles.splitWide]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {hero}
      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={[styles.formWrap, { paddingBottom: insets.bottom + S.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.formTitle}>{title}</Text>
          <Text style={styles.formLead}>{lead}</Text>
          {children}
          <Button
            label="Back to the app"
            variant="ghost"
            icon="left"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as Href))}
            style={styles.back}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Setup() {
  const { createOwner, policy } = useAdmin();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (password !== confirm) {
      setError('The two passwords are different.');
      return;
    }
    setBusy(true);
    // Hashing runs on the JS thread; let the spinner paint first.
    setTimeout(() => {
      const result = createOwner({ name, email, password });
      setBusy(false);
      if (!result.ok) setError(result.error);
    }, 30);
  };

  return (
    <Split
      title="Create the owner account"
      lead="Nobody has set up this dashboard yet. The owner can do everything, and adds everyone else."
    >
      <TextField label="Your name" value={name} onChange={setName} autoCapitalize="words" alwaysEditable />
      <TextField label="Email" value={email} onChange={setEmail} keyboardType="email-address" autoCapitalize="none" alwaysEditable />
      <TextField
        label="Password"
        value={password}
        onChange={setPassword}
        secure
        alwaysEditable
        hint={`At least ${policy.minPasswordLength} characters${policy.requireNumber ? ', with a number' : ''}.`}
      />
      <TextField label="Password again" value={confirm} onChange={setConfirm} secure alwaysEditable onSubmit={submit} />
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <Button label="Create account and open the dashboard" variant="primary" onPress={submit} loading={busy} block />
      <Notice tone="info">
        Accounts live on this device. For a team working from several phones, set up a sync server under
        System once you are in.
      </Notice>
    </Split>
  );
}

function SignIn() {
  const { signIn } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      const result = signIn(email, password);
      setBusy(false);
      if (!result.ok) setError(result.error);
    }, 30);
  };

  return (
    <Split title="Sign in" lead="Use the email and password an owner or administrator set up for you.">
      <TextField label="Email" value={email} onChange={setEmail} keyboardType="email-address" autoCapitalize="none" alwaysEditable />
      <TextField label="Password" value={password} onChange={setPassword} secure alwaysEditable onSubmit={submit} />
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <Button label="Sign in" variant="primary" onPress={submit} loading={busy} disabled={!email || !password} block />
      <Text style={styles.small}>Forgotten your password? An owner or administrator can reset it from the Team page.</Text>
    </Split>
  );
}

function FirstPassword() {
  const { me, changeMyPassword, signOut, policy } = useAdmin();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (next !== confirm) {
      setError('The two new passwords are different.');
      return;
    }
    const result = changeMyPassword(current, next);
    if (!result.ok) setError(result.error);
  };

  return (
    <Split
      title={`Welcome, ${me?.name.split(' ')[0] ?? ''}`}
      lead="You signed in with a temporary password. Choose your own before going on."
    >
      <TextField label="Temporary password" value={current} onChange={setCurrent} secure alwaysEditable />
      <TextField
        label="New password"
        value={next}
        onChange={setNext}
        secure
        alwaysEditable
        hint={`At least ${policy.minPasswordLength} characters${policy.requireNumber ? ', with a number' : ''}${policy.requireSymbol ? ' and a symbol' : ''}.`}
      />
      <TextField label="New password again" value={confirm} onChange={setConfirm} secure alwaysEditable onSubmit={submit} />
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <Button label="Save password" variant="primary" onPress={submit} block />
      <Button label="Sign out" variant="ghost" onPress={() => signOut()} />
    </Split>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: A.mandir },
  split: { flex: 1, backgroundColor: A.canvas },
  splitWide: { flexDirection: 'row' },
  hero: {
    backgroundColor: A.mandir,
    paddingHorizontal: S.xl,
    paddingBottom: S.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.lg,
  },
  heroWide: {
    width: '42%',
    maxWidth: 520,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 56,
    gap: S.xl,
  },
  heroText: { flex: 1, gap: S.sm },
  heroTextWide: { gap: S.sm },
  heroEyebrow: { ...T.eyebrow, color: A.brass },
  heroTitle: { ...T.display, fontSize: 38, lineHeight: 44, color: A.mandirText },
  heroTitlePhone: { fontSize: 26, lineHeight: 32 },
  heroBody: { ...T.body, color: A.mandirMuted, maxWidth: 360 },
  formScroll: { flex: 1 },
  formWrap: { flexGrow: 1, justifyContent: 'center', padding: S.xl },
  form: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: S.md,
    backgroundColor: A.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: A.line,
    padding: S.xl,
  },
  formTitle: { ...T.h1, color: A.ink },
  formLead: { ...T.body, color: A.muted, marginBottom: S.sm },
  small: { ...T.small, color: A.muted, textAlign: 'center' },
  back: { alignSelf: 'center', marginTop: S.xs },
});
