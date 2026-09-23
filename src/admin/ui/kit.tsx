import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAnchors, useContentWidth } from './context';
import { AIcon, type AdminIconName } from './icons';
import { A, R, S, T, TONES, type AdminTone } from './theme';

type Interaction = PressableStateCallbackType & { hovered?: boolean };

/* ------------------------------------------------------------------ *
 * Buttons
 * ------------------------------------------------------------------ */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: AdminIconName;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  /** Stretches to the width of its container. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const BUTTON_COLORS: Record<ButtonVariant, { bg: string; hover: string; fg: string; border: string }> = {
  primary: { bg: A.saffron, hover: A.saffronPressed, fg: A.onSaffron, border: A.saffron },
  secondary: { bg: A.surface, hover: A.hover, fg: A.ink, border: A.lineStrong },
  ghost: { bg: 'transparent', hover: A.sunken, fg: A.body, border: 'transparent' },
  danger: { bg: A.red, hover: '#A83224', fg: A.white, border: A.red },
  dark: { bg: A.mandir, hover: A.mandirActive, fg: A.mandirText, border: A.mandir },
};

export function Button({
  label,
  onPress,
  icon,
  variant = 'secondary',
  size = 'md',
  disabled,
  loading,
  block,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const palette = BUTTON_COLORS[variant];
  const inert = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      disabled={inert}
      onPress={onPress}
      style={(state) => {
        const { pressed, hovered } = state as Interaction;
        return [
          styles.button,
          size === 'sm' && styles.buttonSm,
          block && styles.block,
          {
            backgroundColor: pressed || hovered ? palette.hover : palette.bg,
            borderColor: palette.border,
          },
          inert && styles.inert,
          style,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.fg} />
      ) : (
        <>
          {icon ? <AIcon name={icon} size={size === 'sm' ? 15 : 17} color={palette.fg} strokeWidth={2} /> : null}
          <Text style={[styles.buttonLabel, size === 'sm' && styles.buttonLabelSm, { color: palette.fg }]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'default',
  size = 36,
  disabled,
  active,
}: {
  icon: AdminIconName;
  /** Read out by a screen reader, and shown as a tooltip on web. */
  label: string;
  onPress?: () => void;
  tone?: 'default' | 'danger' | 'onDark';
  size?: number;
  disabled?: boolean;
  active?: boolean;
}) {
  const color =
    tone === 'danger' ? A.red : tone === 'onDark' ? A.mandirText : active ? A.saffronInk : A.body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      // `title` gives a hover tooltip on web; native ignores it.
      {...({ title: label } as object)}
      style={(state) => {
        const { pressed, hovered } = state as Interaction;
        return [
          styles.iconButton,
          { width: size, height: size },
          active && styles.iconButtonActive,
          (pressed || hovered) && (tone === 'onDark' ? styles.iconButtonHoverDark : styles.iconButtonHover),
          disabled && styles.inert,
        ];
      }}
    >
      <AIcon name={icon} size={Math.round(size * 0.5)} color={color} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ *
 * Small labels
 * ------------------------------------------------------------------ */

export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: AdminTone; icon?: AdminIconName }) {
  const palette = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      {icon ? <AIcon name={icon} size={12} color={palette.fg} strokeWidth={2.2} /> : null}
      <Text style={[styles.badgeLabel, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

/** An inline message inside a panel: what happened, or what to watch for. */
export function Notice({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: AdminTone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const palette = TONES[tone];
  const icon: AdminIconName = tone === 'danger' || tone === 'warning' ? 'warning' : tone === 'success' ? 'check' : 'info';
  return (
    <View style={[styles.notice, { backgroundColor: palette.bg }]}>
      <AIcon name={icon} size={18} color={palette.fg} />
      <View style={styles.noticeText}>
        {title ? <Text style={[styles.noticeTitle, { color: palette.fg }]}>{title}</Text> : null}
        {typeof children === 'string' ? (
          <Text style={[styles.noticeBody, { color: palette.fg }]}>{children}</Text>
        ) : (
          children
        )}
      </View>
      {action}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Panels and grids
 * ------------------------------------------------------------------ */

type PanelProps = {
  /** The tool's id: the Tools list and search scroll to it. */
  id?: string;
  title?: string;
  description?: string;
  icon?: AdminIconName;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /** Draws the panel quieter, for secondary information. */
  subtle?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  highlighted?: boolean;
};

/**
 * One tool on a page. A title that says what it changes, a line on what
 * that means in the app, then the controls.
 */
export function Panel({
  id,
  title,
  description,
  icon,
  actions,
  children,
  subtle,
  padded = true,
  style,
  highlighted,
}: PanelProps) {
  const glow = useRef(new Animated.Value(0)).current;
  const node = useRef<View>(null);
  const anchors = useAnchors();
  const lit = highlighted || (!!id && anchors?.highlighted === id);

  useEffect(() => {
    if (!id || !anchors) return;
    return anchors.register(id, node);
  }, [anchors, id]);

  useEffect(() => {
    if (!lit) return;
    glow.setValue(1);
    Animated.timing(glow, { toValue: 0, duration: 2400, useNativeDriver: false }).start();
  }, [glow, lit]);

  const borderColor = glow.interpolate({ inputRange: [0, 1], outputRange: [subtle ? A.sunken : A.line, A.saffron] });

  return (
    <Animated.View
      ref={node as never}
      nativeID={id ? `tool-${id}` : undefined}
      style={[styles.panel, subtle && styles.panelSubtle, { borderColor }, style]}
    >
      {title || actions ? (
        <View style={styles.panelHead}>
          {icon ? (
            <View style={styles.panelIcon}>
              <AIcon name={icon} size={17} color={A.saffronInk} />
            </View>
          ) : null}
          <View style={styles.panelTitles}>
            {title ? <Text style={styles.panelTitle}>{title}</Text> : null}
            {description ? <Text style={styles.panelDescription}>{description}</Text> : null}
          </View>
          {actions ? <View style={styles.panelActions}>{actions}</View> : null}
        </View>
      ) : null}
      {children ? <View style={[padded && styles.panelBody, !title && padded && styles.panelBodyTop]}>{children}</View> : null}
    </Animated.View>
  );
}

/** Lays children out in as many columns as the content width allows. */
export function Grid({
  children,
  min = 340,
  max = 3,
  gap = S.lg,
}: {
  children: React.ReactNode;
  min?: number;
  max?: number;
  gap?: number;
}) {
  const width = useContentWidth();
  const columns = Math.max(1, Math.min(max, Math.floor((width + gap) / (min + gap))));
  const items = React.Children.toArray(children).filter(Boolean);
  if (columns === 1) return <View style={{ gap }}>{items}</View>;

  // Columns fill top to bottom, so a tall panel does not leave a hole in
  // the row beside it.
  const lanes: React.ReactNode[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => lanes[index % columns].push(item));
  return (
    <View style={[styles.gridRow, { gap }]}>
      {lanes.map((lane, index) => (
        <View key={index} style={[styles.gridLane, { gap }]}>
          {lane}
        </View>
      ))}
    </View>
  );
}

export function Row({
  children,
  gap = S.sm,
  wrap,
  align = 'center',
  justify,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  wrap?: boolean;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: align, gap, justifyContent: justify },
        wrap && { flexWrap: 'wrap' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Stack({ children, gap = S.md, style }: { children: React.ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

/* ------------------------------------------------------------------ *
 * Figures
 * ------------------------------------------------------------------ */

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  onPress,
  children,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: AdminIconName;
  tone?: AdminTone;
  onPress?: () => void;
  /** A sparkline or similar under the figure. */
  children?: React.ReactNode;
}) {
  const palette = TONES[tone];
  const body = (
    <>
      <View style={styles.statHead}>
        <Text style={styles.statLabel} numberOfLines={1}>
          {label}
        </Text>
        {icon ? (
          <View style={[styles.statIcon, { backgroundColor: palette.bg }]}>
            <AIcon name={icon} size={15} color={palette.fg} />
          </View>
        ) : null}
      </View>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? (
        <Text style={styles.statHint} numberOfLines={2}>
          {hint}
        </Text>
      ) : null}
      {children}
    </>
  );
  if (!onPress) return <View style={styles.stat}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={(state) => [styles.stat, (state as Interaction).hovered && styles.statHover]}
    >
      {body}
    </Pressable>
  );
}

export function EmptyState({
  icon = 'layers',
  title,
  body,
  action,
}: {
  icon?: AdminIconName;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <AIcon name={icon} size={22} color={A.subtle} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

/** Label on the left, value on the right; stacks on a narrow screen. */
export function KeyValue({ rows }: { rows: { label: string; value: React.ReactNode; mono?: boolean }[] }) {
  const width = useContentWidth();
  const stacked = width < 420;
  return (
    <View>
      {rows.map((row, index) => (
        <View key={row.label} style={[styles.kvRow, stacked && styles.kvStacked, index > 0 && styles.kvDivider]}>
          <Text style={styles.kvLabel}>{row.label}</Text>
          {typeof row.value === 'string' || typeof row.value === 'number' ? (
            <Text style={[styles.kvValue, row.mono && T.mono, !stacked && styles.kvValueRight]} selectable>
              {row.value}
            </Text>
          ) : (
            row.value
          )}
        </View>
      ))}
    </View>
  );
}

/** A tappable list row with an icon, two lines and a trailing element. */
export function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  selected,
  leading,
}: {
  icon?: AdminIconName;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  leading?: React.ReactNode;
}) {
  const content = (
    <>
      {leading ??
        (icon ? (
          <View style={styles.rowIcon}>
            <AIcon name={icon} size={17} color={A.body} />
          </View>
        ) : null)}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.listRow}>
        {content}
        {trailing}
      </View>
    );
  }
  // `trailing` may hold its own buttons, so it sits beside the pressable
  // body rather than inside it.
  return (
    <View style={styles.listRowOuter}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ selected: !!selected }}
        onPress={onPress}
        style={(state) => {
          const { pressed, hovered } = state as Interaction;
          return [styles.listRow, styles.listRowFill, (hovered || pressed) && styles.listRowHover, selected && styles.listRowSelected];
        }}
      >
        {content}
      </Pressable>
      {trailing}
    </View>
  );
}

/** Shows `children` a moment after `when` becomes true — for "Saved" ticks. */
export function useFlash(ms = 1600): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const flash = () => {
    setOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), ms);
  };
  return [on, flash];
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    paddingHorizontal: S.lg,
    borderRadius: R.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
  },
  buttonSm: { minHeight: 32, paddingHorizontal: S.md, borderRadius: R.sm },
  block: { alignSelf: 'stretch' },
  buttonLabel: { ...T.button },
  buttonLabelSm: { fontSize: 13 },
  inert: { opacity: 0.45 },

  iconButton: { borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  iconButtonHover: { backgroundColor: A.sunken },
  iconButtonHoverDark: { backgroundColor: A.mandirRaised },
  iconButtonActive: { backgroundColor: A.saffronSoft },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: R.pill,
    alignSelf: 'flex-start',
  },
  badgeLabel: { ...T.label, fontSize: 12, lineHeight: 16 },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.md,
    padding: S.md,
    borderRadius: R.md,
  },
  noticeText: { flex: 1, gap: 2 },
  noticeTitle: { ...T.h3 },
  noticeBody: { ...T.small },

  panel: {
    backgroundColor: A.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: A.line,
  },
  panelSubtle: { backgroundColor: A.hover },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
  },
  panelIcon: {
    width: 32,
    height: 32,
    borderRadius: R.md,
    backgroundColor: A.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitles: { flex: 1, gap: 2, minWidth: 0 },
  panelTitle: { ...T.h2, color: A.ink },
  panelDescription: { ...T.small, color: A.muted },
  panelActions: { flexDirection: 'row', gap: S.sm, alignItems: 'center', flexShrink: 0 },
  panelBody: { padding: S.lg, gap: S.md },
  panelBodyTop: { paddingTop: S.lg },

  gridRow: { flexDirection: 'row', alignItems: 'flex-start' },
  gridLane: { flex: 1, minWidth: 0 },

  divider: { height: 1, backgroundColor: A.line },

  stat: {
    flex: 1,
    minWidth: 150,
    backgroundColor: A.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: A.line,
    padding: S.lg,
    gap: 4,
  },
  statHover: { borderColor: A.lineStrong, backgroundColor: A.hover },
  statHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.sm },
  statLabel: { ...T.label, color: A.muted, flex: 1 },
  statIcon: { width: 26, height: 26, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  statValue: { ...T.display, color: A.ink, fontVariant: ['tabular-nums'] },
  statHint: { ...T.small, color: A.muted },

  empty: { alignItems: 'center', paddingVertical: S.xl, paddingHorizontal: S.lg, gap: S.sm },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: A.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.xs,
  },
  emptyTitle: { ...T.h3, color: A.ink, textAlign: 'center' },
  emptyBody: { ...T.small, color: A.muted, textAlign: 'center', maxWidth: 360 },
  emptyAction: { marginTop: S.sm },

  kvRow: { flexDirection: 'row', justifyContent: 'space-between', gap: S.lg, paddingVertical: S.sm },
  kvStacked: { flexDirection: 'column', gap: 2 },
  kvDivider: { borderTopWidth: 1, borderTopColor: A.line },
  kvLabel: { ...T.label, color: A.muted },
  kvValue: { ...T.body, color: A.ink, flexShrink: 1 },
  kvValueRight: { textAlign: 'right' },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.md,
    paddingVertical: S.sm + 2,
    borderRadius: R.md,
  },
  listRowOuter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listRowFill: { flex: 1, minWidth: 0 },
  listRowHover: { backgroundColor: A.hover },
  listRowSelected: { backgroundColor: A.saffronSoft },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: R.md,
    backgroundColor: A.sunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { ...T.label, color: A.ink },
  rowSubtitle: { ...T.small, color: A.muted },
});
