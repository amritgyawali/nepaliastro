import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useCallback, useEffect, useState } from 'react';
import { PixelRatio, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { configProblem } from '@/config/merge';
import { DEVICE_CONFIG_URL, pullConfig, pushConfig } from '@/config/remote';
import { CONFIG_AREAS, CONFIG_SCHEMA_VERSION, type ConfigArea } from '@/config/schema';
import { useAppConfig } from '@/config/store';
import { chartFor, panchangFor, placeOf } from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';

import { useAdmin } from '../auth/store';
import { ago, saveText } from '../format';
import { formatBytes } from '../media';
import { Meter } from '../ui/charts';
import { NumberField, Segmented, Select, TextField, Toggle } from '../ui/fields';
import { Badge, Button, Grid, IconButton, KeyValue, Notice, Panel, Row } from '../ui/kit';
import { copyText, useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { A, S, T } from '../ui/theme';

/** Storage keys that hold the dashboard's own accounts. Deleting them here would be a way round the sign-in. */
const PROTECTED = ['astronepali.admin.team.v1', 'astronepali.admin.session.v1', 'astronepali.admin.audit.v1'];

type Stored = { key: string; bytes: number };

export default function System() {
  const admin = useAdmin();
  const { policy, setPolicy, remote, setRemote, me, log } = admin;
  const config = useAppConfig();
  const { live, draft, importDraft, adopt, resetArea, factoryReset } = config;
  const { profile, reset: resetProfile } = useOnboarding();
  const { confirm, prompt, toast } = useOverlay();
  const { width, height } = useWindowDimensions();
  const [stored, setStored] = useState<Stored[]>([]);
  const [area, setArea] = useState<ConfigArea>('theme');
  const [syncing, setSyncing] = useState<'push' | 'pull' | null>(null);
  const [engine, setEngine] = useState<{ ms: number; line: string } | null>(null);
  const [which, setWhich] = useState<'live' | 'draft'>('live');

  const loadStorage = useCallback(async () => {
    const keys = (await AsyncStorage.getAllKeys().catch(() => [])) as string[];
    const pairs = await AsyncStorage.multiGet(keys).catch(() => [] as [string, string | null][]);
    setStored(pairs.map(([key, value]) => ({ key, bytes: value ? value.length * 2 : 0 })).sort((a, b) => b.bytes - a.bytes));
  }, []);

  useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  const totalStored = stored.reduce((sum, s) => sum + s.bytes, 0);

  const exportConfig = async () => {
    const chosen = which === 'live' ? live : draft;
    const text = JSON.stringify(chosen, null, 2);
    const result = await saveText(`astronepali-config-r${chosen.meta.revision}${which === 'draft' ? '-draft' : ''}.json`, text, 'application/json');
    if (result === 'failed') {
      const copied = await copyText(text);
      toast(copied ? 'Copied to the clipboard instead' : 'The config could not be saved', copied ? 'neutral' : 'danger');
    } else toast('Config exported');
    log('Exported the config', 'system', which);
  };

  const importConfig = async () => {
    const text = await prompt({
      title: 'Import a config',
      body: 'Paste the contents of an exported config file. It goes into the draft; nothing changes in the app until you publish.',
      multiline: true,
      confirmLabel: 'Load into the draft',
      validate: (value) => {
        try {
          return configProblem(JSON.parse(value));
        } catch {
          return 'That is not valid JSON.';
        }
      },
    });
    if (!text) return;
    importDraft(JSON.parse(text));
    log('Imported a config into the draft', 'system', '');
    toast('Loaded into the draft. Review it under Publish.');
  };

  const push = async () => {
    setSyncing('push');
    try {
      await pushConfig(remote, live);
      setRemote({ lastPushAt: Date.now() });
      log('Sent the live config to the server', 'system', `Revision ${live.meta.revision}`);
      toast(`Revision ${live.meta.revision} sent`);
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Sending failed', 'danger');
    } finally {
      setSyncing(null);
    }
  };

  const pull = async () => {
    setSyncing('pull');
    try {
      const remoteConfig = await pullConfig(remote);
      setRemote({ lastPullAt: Date.now() });
      const ok = await confirm({
        title: `Use revision ${remoteConfig.meta.revision} from the server?`,
        body: `This device is on revision ${live.meta.revision}. The server’s version becomes live here, and the draft is replaced.`,
        confirmLabel: 'Use it',
      });
      if (!ok) return;
      config.setReturnTo('/admin/system');
      adopt(remoteConfig);
      log('Took the config from the server', 'system', `Revision ${remoteConfig.meta.revision}`);
      toast('Server config is live on this device');
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Fetching failed', 'danger');
    } finally {
      setSyncing(null);
    }
  };

  const runEngine = () => {
    const started = Date.now();
    const panchang = panchangFor(new Date(), placeOf(profile));
    const chart = chartFor(profile);
    const ms = Date.now() - started;
    setEngine({
      ms,
      line: `${panchang.tithi.paksha} ${panchang.tithi.name}, ${panchang.nakshatra.meta.name} nakshatra${chart ? ` · chart: ${chart.rashi.vedic} moon` : ''}`,
    });
  };

  return (
    <AdminPage section="system">
      <Grid min={420} max={2}>
        <Panel id="security-policy" title="Sign-in rules" description="For everyone who signs in to this dashboard" icon="lock">
          <NumberField label="Lock after this many idle minutes" value={policy.autoLockMinutes} min={0} max={480} step={5} onChange={(v) => setPolicy({ autoLockMinutes: v ?? 30 })} hint="0 never locks. Short is safer on a shared phone." />
          <NumberField label="Wrong passwords before an account locks" value={policy.maxAttempts} min={3} max={20} onChange={(v) => setPolicy({ maxAttempts: v ?? 5 })} />
          <NumberField label="Minutes an account stays locked" value={policy.lockMinutes} min={1} max={1440} onChange={(v) => setPolicy({ lockMinutes: v ?? 15 })} />
          <NumberField label="Shortest password" value={policy.minPasswordLength} min={6} max={64} onChange={(v) => setPolicy({ minPasswordLength: v ?? 8 })} />
          <Toggle label="Passwords need a number" value={policy.requireNumber} onChange={(requireNumber) => setPolicy({ requireNumber })} />
          <Toggle label="Passwords need a symbol" value={policy.requireSymbol} onChange={(requireSymbol) => setPolicy({ requireSymbol })} />
          <Notice tone="info">New rules apply to the next password someone sets.</Notice>
        </Panel>

        <Panel id="remote-sync" title="Sync with a server" description="Put the live config somewhere every phone can read it. Builds made with EXPO_PUBLIC_CONFIG_URL pick up a newer revision when they start." icon="cloud">
          <TextField label="Address" value={remote.url} onChange={(url) => setRemote({ url: url.trim() })} mono autoCapitalize="none" placeholder="https://api.example.com/astronepali/config" />
          <Row gap={S.md} wrap>
            <View style={styles.half}>
              <TextField label="Token header" value={remote.headerName} onChange={(headerName) => setRemote({ headerName })} mono autoCapitalize="none" placeholder="Authorization" />
            </View>
            <View style={styles.half}>
              <Segmented label="Send with" value={remote.method} onChange={(method) => setRemote({ method })} options={[{ value: 'PUT', label: 'PUT' }, { value: 'POST', label: 'POST' }]} />
            </View>
          </Row>
          <TextField label="Token" value={remote.token} onChange={(token) => setRemote({ token })} secure placeholder="Kept on this device only" />
          <Row gap={S.sm} wrap>
            <Button label={`Send revision ${live.meta.revision}`} icon="upload" variant="primary" onPress={push} loading={syncing === 'push'} disabled={!remote.url} />
            <Button label="Fetch from the server" icon="download" onPress={pull} loading={syncing === 'pull'} disabled={!remote.url} />
          </Row>
          <KeyValue
            rows={[
              { label: 'Last sent', value: ago(remote.lastPushAt) },
              { label: 'Last fetched', value: ago(remote.lastPullAt) },
              { label: 'Phones read from', value: DEVICE_CONFIG_URL || 'Not set in this build', mono: true },
            ]}
          />
        </Panel>

        <Panel id="export" title="Export the config" description="Everything the dashboard controls, as one file: a backup, or a way to move it to another device" icon="download">
          <Segmented value={which} onChange={setWhich} alwaysEditable options={[{ value: 'live', label: `Live (r${live.meta.revision})` }, { value: 'draft', label: 'Draft' }]} />
          <Button label="Export" icon="download" onPress={exportConfig} />
          <Text style={styles.note}>Team accounts, passwords and the API key are never in the file.</Text>
        </Panel>

        <Panel id="import" title="Import a config" description="Loads an exported config into the draft, so you can review it before publishing" icon="upload">
          <Button label="Paste a config" icon="upload" onPress={importConfig} />
          <Text style={styles.note}>A config from an older version of the app is filled in with today’s defaults for anything it lacks.</Text>
        </Panel>

        <Panel id="reset-area" title="Reset one part" description="Puts one part of the draft back to how the app shipped. Publish to make it live." icon="refresh">
          <Select alwaysEditable label="Part" value={area} onChange={(v) => setArea(v as ConfigArea)} options={CONFIG_AREAS.map((a) => ({ value: a.id, label: a.label }))} />
          <Button
            label={`Reset ${CONFIG_AREAS.find((a) => a.id === area)?.label}`}
            variant="danger"
            onPress={async () => {
              const label = CONFIG_AREAS.find((a) => a.id === area)?.label;
              const ok = await confirm({ title: `Reset ${label} in the draft?`, confirmLabel: 'Reset', destructive: true });
              if (!ok) return;
              resetArea(area);
              log('Reset a part of the draft', area, label ?? area);
              toast(`${label} reset in the draft`);
            }}
          />
        </Panel>

        <Panel id="factory-reset" title="Reset everything" description="The app exactly as it shipped: the draft, live config and history are wiped. Team accounts stay." icon="warning">
          <Button
            label="Reset the whole app"
            variant="danger"
            onPress={async () => {
              const typed = await prompt({
                title: 'Reset everything?',
                body: 'Every published change and every earlier version is deleted on this device. Type RESET to go ahead.',
                confirmLabel: 'Reset everything',
                validate: (value) => (value.trim() === 'RESET' ? null : 'Type RESET in capitals.'),
              });
              if (!typed) return;
              config.setReturnTo('/admin/system');
              factoryReset();
              log('Reset everything', 'system', `by ${me?.name}`);
              toast('Everything is back to how it shipped');
            }}
          />
        </Panel>

        <Panel
          id="storage"
          title="Storage on this device"
          description="What the app keeps on this phone"
          icon="database"
          actions={<IconButton icon="refresh" label="Refresh" onPress={loadStorage} />}
        >
          <Meter value={totalStored} max={6 * 1024 * 1024} tone={totalStored > 4 * 1024 * 1024 ? A.red : A.saffron} />
          <Text style={styles.note}>{formatBytes(totalStored)} of the roughly 6 MB a phone allows an app.</Text>
          {stored.map((item) => (
            <View key={item.key} style={styles.storeRow}>
              <Text style={styles.storeKey} numberOfLines={1}>
                {item.key}
              </Text>
              <Text style={styles.storeSize}>{formatBytes(item.bytes)}</Text>
              {PROTECTED.includes(item.key) ? (
                <Badge label="Protected" icon="lock" />
              ) : (
                <IconButton
                  icon="trash"
                  label={`Delete ${item.key}`}
                  tone="danger"
                  size={30}
                  onPress={async () => {
                    const ok = await confirm({ title: `Delete ${item.key}?`, body: 'The part of the app that uses it starts again from its defaults the next time it opens.', confirmLabel: 'Delete', destructive: true });
                    if (!ok) return;
                    await AsyncStorage.removeItem(item.key);
                    log('Deleted stored data', 'system', item.key);
                    loadStorage();
                  }}
                />
              )}
            </View>
          ))}
        </Panel>

        <Panel id="device-profile" title="The profile on this device" description="The birth details the app on this phone reads from" icon="user">
          <KeyValue
            rows={[
              { label: 'Name', value: profile.name || '—' },
              { label: 'Birth date', value: profile.birthDate ? `${profile.birthDate.year}-${profile.birthDate.month}-${profile.birthDate.day}` : '—' },
              { label: 'Birth time', value: profile.birthTimeUnknown ? 'Not known' : profile.birthTime ? `${profile.birthTime.hour}:${String(profile.birthTime.minute).padStart(2, '0')} ${profile.birthTime.period}` : '—' },
              { label: 'Birth place', value: profile.birthPlace || '—' },
              { label: 'Languages', value: profile.languages.join(', ') || '—' },
              { label: 'Onboarding finished', value: profile.completed ? 'Yes' : 'No' },
            ]}
          />
          <Button
            label="Clear this profile"
            variant="danger"
            onPress={async () => {
              const ok = await confirm({ title: 'Clear the profile on this device?', body: 'The app starts again at the first onboarding question. The dashboard is not affected.', confirmLabel: 'Clear profile', destructive: true });
              if (!ok) return;
              resetProfile();
              log('Cleared the device profile', 'system', '');
              toast('Profile cleared');
            }}
          />
        </Panel>

        <Panel id="diagnostics" title="About this device" description="For a bug report" icon="info">
          <KeyValue
            rows={[
              { label: 'App version', value: Constants.expoConfig?.version ?? '—' },
              { label: 'Platform', value: `${Platform.OS} ${String(Platform.Version ?? '')}` },
              { label: 'JavaScript engine', value: (globalThis as { HermesInternal?: unknown }).HermesInternal ? 'Hermes' : 'Other' },
              { label: 'Window', value: `${Math.round(width)} × ${Math.round(height)} at ${PixelRatio.get()}×` },
              { label: 'Live revision', value: String(live.meta.revision) },
              { label: 'Config format', value: `v${CONFIG_SCHEMA_VERSION}` },
              { label: 'Config size', value: formatBytes(JSON.stringify(live).length * 2) },
            ]}
          />
          <Button
            label="Copy these details"
            size="sm"
            icon="copy"
            onPress={async () => {
              const ok = await copyText(`AstroNepali ${Constants.expoConfig?.version} · ${Platform.OS} ${Platform.Version} · ${width}×${height} · r${live.meta.revision}`);
              toast(ok ? 'Copied' : 'Copying is not available here', 'neutral');
            }}
          />
        </Panel>

        <Panel id="engine-check" title="Astrology engine check" description="Works out today’s panchang and this device’s chart, and times it" icon="kundli">
          <Button label="Run the check" icon="play" onPress={runEngine} />
          {engine ? (
            <Notice tone={engine.ms < 400 ? 'success' : 'warning'} title={`${engine.ms} ms`}>
              {engine.line}
            </Notice>
          ) : null}
          <Text style={styles.note}>Everything is computed on the phone. Over a second on a mid-range phone is worth reporting.</Text>
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  half: { flex: 1, minWidth: 150 },
  note: { ...T.small, color: A.muted },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingVertical: 2 },
  storeKey: { ...T.mono, color: A.body, flex: 1 },
  storeSize: { ...T.small, color: A.muted },
});
