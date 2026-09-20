import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NavHeader, PrimaryButton, Screen } from '@/components';
import { AI_MODEL, BUILD_TIME_KEY, looksLikeKey } from '@/lib/ai';
import { notificationsSupported } from '@/lib/notifications';
import { formatSlotTime, upcomingSlots } from '@/lib/predictions';
import { usePredictions } from '@/store/predictions';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** Whether the readings are sent, how often, and who writes them. */
export default function PredictionAlertsScreen() {
  const {
    settings,
    setEnabled,
    setOvernight,
    setApiKey,
    refresh,
    sendTest,
    working,
    aiReady,
    aiError,
    permission,
    scheduled,
    current,
  } = usePredictions();

  const [keyInput, setKeyInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const next = useMemo(
    () => upcomingSlots(new Date(), 4, settings.overnight),
    [settings.overnight],
  );

  /** A saved key is never shown back — only that there is one. */
  const keySaved = settings.apiKey.trim().length > 0;

  const saveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    if (!looksLikeKey(trimmed)) {
      setNotice('An Anthropic key starts with “sk-ant-”. Check what you pasted.');
      return;
    }
    setApiKey(trimmed);
    setKeyInput('');
    setNotice('Key saved. Writing today’s readings with it now.');
    await refresh({ rewrite: true });
  };

  const removeKey = () => {
    setApiKey('');
    setNotice('Key removed. Readings are written on your device again.');
  };

  const test = async () => {
    if (!current) {
      setNotice('Your readings are still being written — try again in a moment.');
      return;
    }

    const sent = await sendTest();
    setNotice(
      sent
        ? 'Sent — it should appear in a couple of seconds.'
        : notificationsSupported
          ? 'Your phone is not allowing notifications for this app yet.'
          : 'The browser build cannot send notifications; try it on a phone.',
    );
  };

  return (
    <Screen background={colors.white}>
      <NavHeader title="Prediction alerts" bordered />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        >
          <Text style={styles.lead}>
            A reading written from your own kundli, every five hours. Tapping it opens the
            whole text, with an astrologer at the bottom of it.
          </Text>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.rowLabel}>Send my readings</Text>
                <Text style={styles.rowNote}>Four a day: 6 AM, 11 AM, 4 PM and 9 PM.</Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={setEnabled}
                trackColor={{ true: colors.saffron, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>

            <View style={[styles.switchRow, styles.rowDivider]}>
              <View style={styles.switchText}>
                <Text style={styles.rowLabel}>Include the 1 AM reading</Text>
                <Text style={styles.rowNote}>
                  Completes the five-hour cycle through the night. Off by default.
                </Text>
              </View>
              <Switch
                value={settings.overnight}
                onValueChange={setOvernight}
                disabled={!settings.enabled}
                trackColor={{ true: colors.saffron, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {permission === 'denied' && settings.enabled ? (
            <Text style={styles.warning}>
              Your phone is blocking notifications for AstroNepali. Turn them on in the system
              settings and the schedule fills in again by itself.
            </Text>
          ) : null}

          {!notificationsSupported ? (
            <Text style={styles.warning}>
              This is the browser build, which cannot schedule notifications. Everything else
              works, and the readings are waiting in “Your predictions”.
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Next readings</Text>

          <View style={styles.card}>
            {next.map((at, index) => (
              <View key={at.toISOString()} style={[styles.row, index > 0 && styles.rowDivider]}>
                <Text style={styles.rowLabel}>{formatSlotTime(at)}</Text>
                <Text style={styles.rowNote}>
                  {at.toDateString() === new Date().toDateString() ? 'Today' : 'Tomorrow'}
                </Text>
              </View>
            ))}
          </View>

          {notificationsSupported ? (
            <Text style={styles.note}>
              {scheduled > 0
                ? `${scheduled} reading${scheduled === 1 ? '' : 's'} queued with your phone.`
                : 'Nothing queued yet — open the app once with alerts on and the schedule fills in.'}
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Who writes them</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                {aiReady ? 'Our AI astrologer' : 'Your device'}
              </Text>
              <Text style={styles.rowNote}>
                {aiReady
                  ? `Written by ${AI_MODEL} from your chart, in your language, a day at a time.`
                  : 'Composed from your chart on the phone itself. Add a key below and the writing gets better.'}
              </Text>
            </View>

            {BUILD_TIME_KEY && !keySaved ? (
              <View style={[styles.row, styles.rowDivider]}>
                <Text style={styles.rowLabel}>Key</Text>
                <Text style={styles.rowNote}>
                  Using the key this build was made with. A key saved here replaces it.
                </Text>
              </View>
            ) : null}

            {keySaved ? (
              <View style={[styles.row, styles.rowDivider]}>
                <Text style={styles.rowLabel}>Key</Text>
                <Text style={styles.rowNote}>Saved on this device. It is never shown again.</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.keyBlock}>
            <Text style={styles.fieldLabel}>Anthropic API key</Text>
            <TextInput
              value={keyInput}
              onChangeText={(value) => {
                setKeyInput(value);
                setNotice(null);
              }}
              placeholder="sk-ant-…"
              placeholderTextColor={colors.subtle}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
            />

            <View style={styles.actions}>
              <PrimaryButton
                label={working ? 'Writing…' : 'Save key'}
                onPress={saveKey}
                disabled={working || keyInput.trim().length === 0}
                style={styles.action}
              />
              {keySaved ? (
                <PrimaryButton
                  label="Remove"
                  variant="outline"
                  onPress={removeKey}
                  style={styles.action}
                />
              ) : null}
            </View>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {aiError ? <Text style={styles.warning}>{aiError}</Text> : null}

          <Text style={styles.note}>
            The key is kept on this device only, and is sent nowhere but the Anthropic API. A
            key inside an app can always be read off the phone it is on, so for a published
            build set EXPO_PUBLIC_ASTRO_AI_URL to your own endpoint and keep the real key there.
          </Text>

          <View style={styles.footerActions}>
            <PrimaryButton
              label="Rewrite today’s readings"
              variant="outline"
              onPress={() => refresh({ rewrite: true })}
              disabled={working}
            />
            <PrimaryButton label="Send me one now" variant="outline" onPress={test} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
  },
  lead: {
    ...type.body,
    color: colors.muted,
    marginBottom: space.lg,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  switchText: {
    flex: 1,
    gap: 1,
  },
  row: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: 1,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowLabel: {
    ...type.label,
    color: colors.ink,
  },
  rowNote: {
    ...type.small,
    color: colors.muted,
  },
  sectionTitle: {
    ...type.section,
    color: colors.ink,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  note: {
    ...type.small,
    color: colors.muted,
    marginTop: space.md,
  },
  notice: {
    ...type.small,
    color: colors.green,
    marginTop: space.md,
  },
  warning: {
    ...type.small,
    color: colors.red,
    marginTop: space.md,
  },
  keyBlock: {
    marginTop: space.lg,
    gap: space.sm,
  },
  fieldLabel: {
    ...type.caption,
    color: colors.muted,
  },
  input: {
    ...type.body,
    color: colors.ink,
    height: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  action: {
    flex: 1,
  },
  footerActions: {
    marginTop: space.xl,
    gap: space.md,
  },
});
