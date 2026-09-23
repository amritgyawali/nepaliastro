import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useCanEdit } from './context';
import { AIcon, type AdminIconName } from './icons';
import { IconButton } from './kit';
import { Sheet } from './overlay';
import { A, R, S, T } from './theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

/* ------------------------------------------------------------------ *
 * Field frame
 * ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  children,
  trailing,
  style,
}: {
  label?: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  /** Beside the label: a counter, a reset link. */
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, style]}>
      {label || trailing ? (
        <View style={styles.fieldHead}>
          {label ? <Text style={styles.fieldLabel}>{label}</Text> : <View />}
          {trailing}
        </View>
      ) : null}
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Text
 * ------------------------------------------------------------------ */

type TextFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string | null;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
  secure?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Ignore the section's read-only state — for sign-in forms and search. */
  alwaysEditable?: boolean;
  icon?: AdminIconName;
  onSubmit?: () => void;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
  accessibilityLabel?: string;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  multiline,
  rows = 4,
  mono,
  secure,
  maxLength,
  keyboardType,
  autoCapitalize,
  alwaysEditable,
  icon,
  onSubmit,
  style,
  autoFocus,
  accessibilityLabel,
}: TextFieldProps) {
  const canEdit = useCanEdit() || !!alwaysEditable;
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      style={style}
      trailing={
        maxLength ? (
          <Text style={[styles.counter, value.length > maxLength * 0.9 && styles.counterWarn]}>
            {value.length}/{maxLength}
          </Text>
        ) : undefined
      }
    >
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          !canEdit && styles.inputReadOnly,
        ]}
      >
        {icon ? <AIcon name={icon} size={17} color={A.subtle} /> : null}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={A.subtle}
          editable={canEdit}
          multiline={multiline}
          numberOfLines={multiline ? rows : 1}
          secureTextEntry={secure && !reveal}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? (secure || mono ? 'none' : 'sentences')}
          autoCorrect={!secure && !mono}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmit}
          returnKeyType={onSubmit ? 'done' : undefined}
          autoFocus={autoFocus}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          style={[
            styles.input,
            mono && styles.inputMono,
            multiline && { minHeight: rows * 21 + 16, textAlignVertical: 'top' },
          ]}
        />
        {secure ? (
          <IconButton
            icon={reveal ? 'eyeOff' : 'eye'}
            label={reveal ? 'Hide password' : 'Show password'}
            onPress={() => setReveal((v) => !v)}
            size={32}
          />
        ) : null}
      </View>
    </Field>
  );
}

/* ------------------------------------------------------------------ *
 * Numbers
 * ------------------------------------------------------------------ */

export function NumberField({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  suffix,
  hint,
  allowEmpty,
  decimals,
}: {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
  /** Lets the field be cleared to `null` — "not set". */
  allowEmpty?: boolean;
  decimals?: number;
}) {
  const canEdit = useCanEdit();
  const [text, setText] = useState(value === null ? '' : String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = Number(text);
    if (value === null ? text !== '' : parsed !== value || text === '') setText(value === null ? '' : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const round = (n: number) => (decimals === undefined ? n : Number(n.toFixed(decimals)));

  const commit = (raw: string) => {
    setText(raw);
    if (raw.trim() === '') {
      if (allowEmpty) {
        setError(null);
        onChange(null);
      } else setError('Enter a number.');
      return;
    }
    const parsed = Number(raw.replace(',', '.'));
    if (Number.isNaN(parsed)) {
      setError('Enter a number.');
      return;
    }
    if (parsed < min || parsed > max) {
      setError(`Between ${min === -Infinity ? '…' : min} and ${max === Infinity ? '…' : max}.`);
      return;
    }
    setError(null);
    onChange(round(parsed));
  };

  const nudge = (direction: 1 | -1) => {
    const base = value ?? (min === -Infinity ? 0 : min);
    const next = round(Math.min(max, Math.max(min, base + direction * step)));
    setText(String(next));
    setError(null);
    onChange(next);
  };

  return (
    <Field label={label} hint={hint} error={error}>
      <View style={[styles.inputWrap, styles.numberWrap, !canEdit && styles.inputReadOnly, !!error && styles.inputError]}>
        <IconButton icon="minus" label={`Decrease ${label ?? ''}`} onPress={() => nudge(-1)} disabled={!canEdit} size={34} />
        <TextInput
          value={text}
          onChangeText={commit}
          editable={canEdit}
          keyboardType="decimal-pad"
          accessibilityLabel={label}
          style={[styles.input, styles.numberInput]}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        <IconButton icon="plus" label={`Increase ${label ?? ''}`} onPress={() => nudge(1)} disabled={!canEdit} size={34} />
      </View>
    </Field>
  );
}

/* ------------------------------------------------------------------ *
 * Switches and choices
 * ------------------------------------------------------------------ */

export function Toggle({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const canEdit = useCanEdit() && !disabled;
  // The label and the switch are siblings: the switch is itself a control,
  // and one control may not sit inside another.
  return (
    <View style={styles.toggle}>
      <Pressable
        accessible={false}
        onPress={() => canEdit && onChange(!value)}
        style={(state) => [styles.toggleText, (state as Interaction).hovered && canEdit && styles.toggleHover]}
      >
        <Text style={styles.toggleLabel}>{label}</Text>
        {description ? <Text style={styles.toggleDescription}>{description}</Text> : null}
      </Pressable>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={!canEdit}
        accessibilityLabel={label}
        trackColor={{ false: A.lineStrong, true: A.saffron }}
        thumbColor={A.white}
        {...({ activeThumbColor: A.white } as object)}
      />
    </View>
  );
}

export type Option<T extends string> = { value: T; label: string; icon?: AdminIconName; hint?: string };

/** Two to five options side by side. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  hint,
  alwaysEditable,
}: {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  hint?: string;
  alwaysEditable?: boolean;
}) {
  const canEdit = useCanEdit() || !!alwaysEditable;
  return (
    <Field label={label} hint={hint}>
      <View style={styles.segmented} accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: !canEdit }}
              accessibilityLabel={option.label}
              disabled={!canEdit}
              onPress={() => onChange(option.value)}
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              {option.icon ? <AIcon name={option.icon} size={15} color={selected ? A.ink : A.muted} /> : null}
              <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]} numberOfLines={1}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Field>
  );
}

/** A row of chips; one or several can be chosen. */
export function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
  multiple,
  hint,
}: {
  label?: string;
  options: Option<T>[];
  value: T | T[];
  onChange: (value: T | T[]) => void;
  multiple?: boolean;
  hint?: string;
}) {
  const canEdit = useCanEdit();
  const chosen = Array.isArray(value) ? value : [value];
  const press = (option: T) => {
    if (!multiple) return onChange(option);
    const next = chosen.includes(option) ? chosen.filter((v) => v !== option) : [...chosen, option];
    onChange(next);
  };
  return (
    <Field label={label} hint={hint}>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = chosen.includes(option.value);
          return (
            <Pressable
              key={option.value}
              accessibilityRole={multiple ? 'checkbox' : 'radio'}
              accessibilityState={{ checked: selected, disabled: !canEdit }}
              accessibilityLabel={option.label}
              disabled={!canEdit}
              onPress={() => press(option.value)}
              style={[styles.chip, selected && styles.chipSelected, !canEdit && styles.chipInert]}
            >
              {selected && multiple ? <AIcon name="check" size={13} color={A.saffronInk} strokeWidth={2.4} /> : null}
              {option.icon ? <AIcon name={option.icon} size={14} color={selected ? A.saffronInk : A.muted} /> : null}
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Field>
  );
}

/** A long list of options, chosen from a searchable sheet. */
export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Choose…',
  hint,
  title,
  alwaysEditable,
}: {
  label?: string;
  options: Option<T>[];
  value: T | '';
  onChange: (value: T) => void;
  placeholder?: string;
  hint?: string;
  title?: string;
  /** For choices that only change what is shown, not the draft. */
  alwaysEditable?: boolean;
}) {
  const canEdit = useCanEdit() || !!alwaysEditable;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) => option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle),
    );
  }, [options, query]);

  return (
    <Field label={label} hint={hint}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Choose'}: ${current?.label ?? 'none'}`}
        disabled={!canEdit}
        onPress={() => setOpen(true)}
        style={(state) => [
          styles.inputWrap,
          styles.select,
          (state as Interaction).hovered && canEdit && styles.selectHover,
          !canEdit && styles.inputReadOnly,
        ]}
      >
        {current?.icon ? <AIcon name={current.icon} size={16} color={A.body} /> : null}
        <Text style={[styles.selectText, !current && styles.placeholder]} numberOfLines={1}>
          {current?.label ?? placeholder}
        </Text>
        <AIcon name="down" size={16} color={A.muted} />
      </Pressable>

      <Sheet visible={open} onClose={() => setOpen(false)} title={title ?? label ?? 'Choose'} width={460}>
        {options.length > 8 ? (
          <TextField value={query} onChange={setQuery} placeholder="Search" icon="search" alwaysEditable autoFocus />
        ) : null}
        <View>
          {filtered.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                  setQuery('');
                }}
                style={(state) => [styles.option, ((state as Interaction).hovered || state.pressed) && styles.optionHover]}
              >
                {option.icon ? <AIcon name={option.icon} size={17} color={A.body} /> : null}
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, selected && styles.optionSelected]}>{option.label}</Text>
                  {option.hint ? <Text style={styles.optionHint}>{option.hint}</Text> : null}
                </View>
                {selected ? <AIcon name="check" size={17} color={A.saffronInk} strokeWidth={2.4} /> : null}
              </Pressable>
            );
          })}
          {!filtered.length ? <Text style={styles.optionHint}>Nothing matches “{query}”.</Text> : null}
        </View>
      </Sheet>
    </Field>
  );
}

/* ------------------------------------------------------------------ *
 * Lists of strings
 * ------------------------------------------------------------------ */

export function StringList({
  label,
  items,
  onChange,
  placeholder = 'New line',
  hint,
  multiline,
  addLabel = 'Add',
}: {
  label?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  addLabel?: string;
}) {
  const canEdit = useCanEdit();
  const [draft, setDraft] = useState('');

  const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const add = () => {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft('');
  };

  return (
    <Field label={label} hint={hint}>
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listIndex}>{index + 1}</Text>
            <TextInput
              value={item}
              onChangeText={(value) => update(index, value)}
              editable={canEdit}
              multiline={multiline}
              accessibilityLabel={`${label ?? 'Item'} ${index + 1}`}
              style={[styles.input, styles.listInput]}
            />
            {canEdit ? (
              <View style={styles.listActions}>
                <IconButton icon="up" label="Move up" size={30} onPress={() => move(index, -1)} disabled={index === 0} />
                <IconButton
                  icon="down"
                  label="Move down"
                  size={30}
                  onPress={() => move(index, 1)}
                  disabled={index === items.length - 1}
                />
                <IconButton icon="trash" label="Remove" size={30} tone="danger" onPress={() => remove(index)} />
              </View>
            ) : null}
          </View>
        ))}
        {!items.length ? <Text style={styles.listEmpty}>Nothing here yet.</Text> : null}
        {canEdit ? (
          <View style={styles.listAdd}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={placeholder}
              placeholderTextColor={A.subtle}
              onSubmitEditing={add}
              returnKeyType="done"
              accessibilityLabel={`${addLabel} to ${label ?? 'list'}`}
              style={[styles.input, styles.listInput]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={addLabel}
              onPress={add}
              disabled={!draft.trim()}
              style={[styles.addButton, !draft.trim() && styles.addButtonInert]}
            >
              <AIcon name="plus" size={16} color={A.onSaffron} strokeWidth={2.2} />
              <Text style={styles.addLabel}>{addLabel}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Field>
  );
}

/* ------------------------------------------------------------------ *
 * Dates
 * ------------------------------------------------------------------ */

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function formatDateInput(ms: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseDateInput(text: string): number | null {
  const match = text.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (!match) return null;
  const [, y, m, d, h = '0', min = '0'] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

/** A date and time typed as `2026-10-02 18:00`, or empty for "no limit". */
export function DateTimeField({
  label,
  value,
  onChange,
  hint = 'Year-month-day and 24-hour time, e.g. 2026-10-02 18:00. Leave empty for no limit.',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const [text, setText] = useState(formatDateInput(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (parseDateInput(text) !== value && !(value === 0 && text === '')) setText(formatDateInput(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <TextField
      label={label}
      value={text}
      mono
      placeholder="YYYY-MM-DD HH:MM"
      hint={error ? undefined : hint}
      error={error}
      onChange={(next) => {
        setText(next);
        if (!next.trim()) {
          setError(null);
          onChange(0);
          return;
        }
        const parsed = parseDateInput(next);
        if (parsed === null) setError('Write it as 2026-10-02 18:00.');
        else {
          setError(null);
          onChange(parsed);
        }
      }}
    />
  );
}

/** A horizontally scrolling strip, for chips that may not fit on a phone. */
export function Strip({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  fieldHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.sm },
  fieldLabel: { ...T.label, color: A.body },
  fieldHint: { ...T.small, color: A.muted },
  fieldError: { ...T.small, color: A.red },
  counter: { ...T.small, color: A.subtle, fontVariant: ['tabular-nums'] },
  counterWarn: { color: A.amber },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderWidth: 1,
    borderColor: A.lineStrong,
    borderRadius: R.md,
    backgroundColor: A.surface,
    paddingHorizontal: S.md,
    minHeight: 42,
  },
  inputFocused: { borderColor: A.saffron },
  inputError: { borderColor: A.red },
  inputReadOnly: { backgroundColor: A.sunken, borderColor: A.line },
  input: {
    flex: 1,
    ...T.body,
    color: A.ink,
    paddingVertical: 9,
    minWidth: 0,
    // react-native-web draws its own focus ring inside the frame otherwise.
    outlineStyle: 'none',
  } as object,
  inputMono: { ...T.mono, fontSize: 13.5 },

  numberWrap: { paddingHorizontal: 3 },
  numberInput: { textAlign: 'center', fontVariant: ['tabular-nums'] },
  suffix: { ...T.small, color: A.muted, marginRight: 2 },

  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    marginHorizontal: -S.sm,
  },
  toggleHover: { backgroundColor: A.hover },
  toggleText: { flex: 1, gap: 1, paddingVertical: S.sm, paddingHorizontal: S.sm, borderRadius: R.md },
  toggleLabel: { ...T.label, color: A.ink },
  toggleDescription: { ...T.small, color: A.muted },

  segmented: {
    flexDirection: 'row',
    backgroundColor: A.sunken,
    borderRadius: R.md,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: R.sm,
    paddingHorizontal: S.sm,
  },
  segmentSelected: { backgroundColor: A.surface, borderWidth: 1, borderColor: A.line },
  segmentLabel: { ...T.label, color: A.muted },
  segmentLabelSelected: { color: A.ink },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: S.md,
    minHeight: 32,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: A.lineStrong,
    backgroundColor: A.surface,
  },
  chipSelected: { backgroundColor: A.saffronSoft, borderColor: A.saffron },
  chipInert: { opacity: 0.7 },
  chipLabel: { ...T.label, color: A.body },
  chipLabelSelected: { color: A.saffronInk },

  select: { paddingVertical: 9 },
  selectHover: { borderColor: A.subtle },
  selectText: { ...T.body, color: A.ink, flex: 1 },
  placeholder: { color: A.subtle },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.md,
    paddingVertical: S.md,
    borderRadius: R.md,
  },
  optionHover: { backgroundColor: A.hover },
  optionText: { flex: 1 },
  optionLabel: { ...T.body, color: A.ink },
  optionSelected: { fontFamily: T.h3.fontFamily },
  optionHint: { ...T.small, color: A.muted },

  list: { gap: S.sm },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderWidth: 1,
    borderColor: A.line,
    borderRadius: R.md,
    paddingLeft: S.md,
    paddingRight: 4,
    backgroundColor: A.surface,
  },
  listIndex: { ...T.mono, color: A.subtle, width: 18 },
  listInput: { paddingVertical: 8 },
  listActions: { flexDirection: 'row' },
  listEmpty: { ...T.small, color: A.subtle },
  listAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: A.lineStrong,
    borderRadius: R.md,
    paddingLeft: S.md,
    paddingRight: 4,
    paddingVertical: 3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: A.saffron,
    paddingHorizontal: S.md,
    minHeight: 32,
    borderRadius: R.sm,
  },
  addButtonInert: { opacity: 0.4 },
  addLabel: { ...T.button, fontSize: 13, color: A.onSaffron },

  strip: { gap: S.sm, paddingVertical: 2 },
});
