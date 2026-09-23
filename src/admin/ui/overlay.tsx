import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AIcon } from './icons';
import { Button, IconButton } from './kit';
import { A, BREAKPOINTS, R, S, T, TONES, lift, type AdminTone } from './theme';

/* ------------------------------------------------------------------ *
 * Sheet: a panel over the page. Full screen on a phone, a centred card
 * on anything wider.
 * ------------------------------------------------------------------ */

export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 560,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const phone = windowWidth < BREAKPOINTS.tablet;

  return (
    <Modal
      visible={visible}
      transparent={!phone}
      animationType={phone ? 'slide' : 'fade'}
      onRequestClose={onClose}
      presentationStyle={phone ? 'fullScreen' : 'overFullScreen'}
    >
      <KeyboardAvoidingView
        style={phone ? styles.sheetPhone : styles.sheetBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!phone ? <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" /> : null}
        <View
          style={[
            phone ? [styles.sheetPhoneCard, { paddingTop: insets.top }] : [styles.sheetCard, { width: Math.min(width, windowWidth - 48) }],
          ]}
        >
          <View style={styles.sheetHead}>
            <View style={styles.sheetTitles}>
              <Text style={styles.sheetTitle} numberOfLines={2}>
                {title}
              </Text>
              {subtitle ? <Text style={styles.sheetSubtitle}>{subtitle}</Text> : null}
            </View>
            <IconButton icon="close" label="Close" onPress={onClose} />
          </View>
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetBody}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer ? (
            <View style={[styles.sheetFooter, phone && { paddingBottom: Math.max(insets.bottom, S.md) }]}>{footer}</View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 * Dialogs and toasts, reachable from any handler through hooks.
 * ------------------------------------------------------------------ */

type ConfirmOptions = {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type PromptOptions = {
  title: string;
  body?: string;
  label?: string;
  initial?: string;
  placeholder?: string;
  confirmLabel?: string;
  multiline?: boolean;
  /** Returns an error message, or null when the value is fine. */
  validate?: (value: string) => string | null;
};

type AlertOptions = { title: string; body?: string; copyable?: string };

type DialogState =
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (ok: boolean) => void }
  | { kind: 'prompt'; options: PromptOptions; resolve: (value: string | null) => void }
  | { kind: 'alert'; options: AlertOptions; resolve: () => void };

type Toast = { id: number; message: string; tone: AdminTone };

type OverlayContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  alert: (options: AlertOptions) => Promise<void>;
  toast: (message: string, tone?: AdminTone) => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ kind: 'confirm', options, resolve })),
    [],
  );
  const prompt = useCallback(
    (options: PromptOptions) => new Promise<string | null>((resolve) => setDialog({ kind: 'prompt', options, resolve })),
    [],
  );
  const alert = useCallback(
    (options: AlertOptions) => new Promise<void>((resolve) => setDialog({ kind: 'alert', options, resolve })),
    [],
  );
  const toast = useCallback((message: string, tone: AdminTone = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3200);
  }, []);

  const value = useMemo(() => ({ confirm, prompt, alert, toast }), [confirm, prompt, alert, toast]);

  const close = () => setDialog(null);

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {dialog ? <DialogView state={dialog} onDone={close} /> : null}
      <ToastStack toasts={toasts} />
    </OverlayContext.Provider>
  );
}

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used inside <OverlayProvider>');
  return ctx;
}

function DialogView({ state, onDone }: { state: DialogState; onDone: () => void }) {
  const [value, setValue] = useState(state.kind === 'prompt' ? state.options.initial ?? '' : '');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cancel = () => {
    if (state.kind === 'confirm') state.resolve(false);
    else if (state.kind === 'prompt') state.resolve(null);
    else state.resolve();
    onDone();
  };

  const accept = () => {
    if (state.kind === 'confirm') state.resolve(true);
    else if (state.kind === 'prompt') {
      const problem = state.options.validate?.(value) ?? null;
      if (problem) {
        setError(problem);
        return;
      }
      state.resolve(value);
    } else state.resolve();
    onDone();
  };

  const copy = async () => {
    if (state.kind !== 'alert' || !state.options.copyable) return;
    const ok = await copyText(state.options.copyable);
    setCopied(ok);
  };

  const { title, body } = state.options;
  const destructive = state.kind === 'confirm' && state.options.destructive;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={cancel}>
      <KeyboardAvoidingView style={styles.dialogBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={cancel} accessibilityLabel="Cancel" />
        <View style={styles.dialog} accessibilityViewIsModal>
          {destructive ? (
            <View style={styles.dialogIcon}>
              <AIcon name="warning" size={20} color={A.red} />
            </View>
          ) : null}
          <Text style={styles.dialogTitle}>{title}</Text>
          {body ? <Text style={styles.dialogBody}>{body}</Text> : null}

          {state.kind === 'prompt' ? (
            <View style={styles.dialogField}>
              {state.options.label ? <Text style={styles.dialogLabel}>{state.options.label}</Text> : null}
              <TextInput
                value={value}
                onChangeText={(text) => {
                  setValue(text);
                  setError(null);
                }}
                placeholder={state.options.placeholder}
                placeholderTextColor={A.subtle}
                autoFocus
                multiline={state.options.multiline}
                onSubmitEditing={state.options.multiline ? undefined : accept}
                style={[styles.dialogInput, state.options.multiline && styles.dialogInputMulti]}
              />
              {error ? <Text style={styles.dialogError}>{error}</Text> : null}
            </View>
          ) : null}

          {state.kind === 'alert' && state.options.copyable ? (
            <Pressable onPress={copy} style={styles.copyBox} accessibilityRole="button" accessibilityLabel="Copy">
              <Text style={styles.copyText} selectable>
                {state.options.copyable}
              </Text>
              <Text style={styles.copyHint}>{copied ? 'Copied' : 'Tap to copy'}</Text>
            </Pressable>
          ) : null}

          <View style={styles.dialogActions}>
            {state.kind !== 'alert' ? (
              <Button label={state.kind === 'confirm' ? state.options.cancelLabel ?? 'Cancel' : 'Cancel'} onPress={cancel} />
            ) : null}
            <Button
              label={
                state.kind === 'alert'
                  ? 'Done'
                  : state.options.confirmLabel ?? (state.kind === 'prompt' ? 'Save' : 'Continue')
              }
              variant={destructive ? 'danger' : 'primary'}
              onPress={accept}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  const insets = useSafeAreaInsets();
  if (!toasts.length) return null;
  return (
    <View pointerEvents="none" style={[styles.toasts, { bottom: Math.max(insets.bottom, S.lg) + 72 }]}>
      {toasts.map((toast) => (
        <ToastView key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

function ToastView({ toast }: { toast: Toast }) {
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [enter]);
  const palette = TONES[toast.tone];
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
      ]}
    >
      <View style={[styles.toastDot, { backgroundColor: toast.tone === 'neutral' ? A.brass : palette.fg }]} />
      <Text style={styles.toastText}>{toast.message}</Text>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ *
 * Clipboard, sharing and files
 * ------------------------------------------------------------------ */

/** Copies text where the platform allows it. Returns whether it worked. */
export async function copyText(text: string): Promise<boolean> {
  const nav = (globalThis as { navigator?: { clipboard?: { writeText?: (t: string) => Promise<void> } } }).navigator;
  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

const styles = StyleSheet.create({
  sheetBackdrop: {
    flex: 1,
    backgroundColor: A.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: S.xl,
  },
  sheetCard: {
    maxHeight: '90%',
    backgroundColor: A.surface,
    borderRadius: R.lg,
    overflow: 'hidden',
    ...lift,
  },
  sheetPhone: { flex: 1, backgroundColor: A.surface },
  sheetPhoneCard: { flex: 1, backgroundColor: A.surface },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingLeft: S.lg,
    paddingRight: S.sm,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: A.line,
  },
  sheetTitles: { flex: 1 },
  sheetTitle: { ...T.h2, color: A.ink },
  sheetSubtitle: { ...T.small, color: A.muted },
  sheetScroll: { flexGrow: 0, flexShrink: 1 },
  sheetBody: { padding: S.lg, gap: S.md },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: S.sm,
    padding: S.md,
    borderTopWidth: 1,
    borderTopColor: A.line,
    backgroundColor: A.hover,
  },

  dialogBackdrop: {
    flex: 1,
    backgroundColor: A.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: S.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: A.surface,
    borderRadius: R.lg,
    padding: S.xl,
    gap: S.sm,
    ...lift,
  },
  dialogIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: A.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.xs,
  },
  dialogTitle: { ...T.h2, color: A.ink },
  dialogBody: { ...T.body, color: A.muted },
  dialogField: { gap: 6, marginTop: S.sm },
  dialogLabel: { ...T.label, color: A.body },
  dialogInput: {
    ...T.body,
    color: A.ink,
    borderWidth: 1,
    borderColor: A.lineStrong,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: S.sm + 2,
    backgroundColor: A.surface,
  },
  dialogInputMulti: { minHeight: 120, textAlignVertical: 'top' },
  dialogError: { ...T.small, color: A.red },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: S.sm, marginTop: S.lg },
  copyBox: {
    marginTop: S.sm,
    padding: S.md,
    borderRadius: R.md,
    backgroundColor: A.sunken,
    borderWidth: 1,
    borderColor: A.line,
    gap: 4,
  },
  copyText: { ...T.mono, fontSize: 16, color: A.ink },
  copyHint: { ...T.small, color: A.muted },

  toasts: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: S.sm },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    maxWidth: 440,
    marginHorizontal: S.lg,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderRadius: R.pill,
    backgroundColor: A.mandir,
    ...lift,
  },
  toastDot: { width: 8, height: 8, borderRadius: 4 },
  toastText: { ...T.label, color: A.mandirText, flexShrink: 1 },
});
