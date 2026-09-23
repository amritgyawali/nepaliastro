import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { A, R, S, T } from './theme';

/**
 * The dashboard's charts. Every one of them shows a single measure, so the
 * panel title names it and there is no legend; bars and lines are the one
 * saffron, the grid stays faint, and the numbers are in ink, not in colour.
 * Pointing at (or tapping) a bar shows its exact value.
 */

export type Point = { label: string; value: number; detail?: string };

function niceMax(value: number): number {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= value / 1) ?? 10;
  return step * magnitude;
}

/** Vertical bars over time, with a value readout for the bar in focus. */
export function BarChart({
  data,
  height = 180,
  unit = '',
  labelEvery,
}: {
  data: Point[];
  height?: number;
  unit?: string;
  /** Print every nth label on the axis; the rest are one tap away. */
  labelEvery?: number;
}) {
  const [width, setWidth] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const plotHeight = height - 24;
  const gap = 2;
  const barWidth = data.length ? Math.max(2, (width - gap * (data.length - 1)) / data.length) : 0;
  const every = labelEvery ?? Math.max(1, Math.ceil(data.length / 7));
  const focused = focus !== null ? data[focus] : null;

  return (
    <View>
      <View style={styles.readout}>
        <Text style={styles.readoutValue}>
          {focused ? `${focused.value.toLocaleString()}${unit}` : `${data.reduce((s, d) => s + d.value, 0).toLocaleString()}${unit}`}
        </Text>
        <Text style={styles.readoutLabel}>{focused ? focused.detail ?? focused.label : `Total, ${data.length} days`}</Text>
      </View>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <>
            <Svg width={width} height={plotHeight}>
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <Line
                  key={f}
                  x1={0}
                  x2={width}
                  y1={plotHeight - f * (plotHeight - 4)}
                  y2={plotHeight - f * (plotHeight - 4)}
                  stroke={A.line}
                  strokeWidth={1}
                  strokeDasharray={f === 1 ? undefined : '2 4'}
                />
              ))}
              {data.map((d, i) => {
                const h = d.value > 0 ? Math.max(3, (d.value / max) * (plotHeight - 4)) : 0;
                const x = i * (barWidth + gap);
                const y = plotHeight - h;
                const r = Math.min(4, barWidth / 2, h);
                const on = focus === i;
                return h > 0 ? (
                  <Path
                    key={i}
                    d={`M${x} ${plotHeight}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + barWidth - r}Q${x + barWidth} ${y} ${x + barWidth} ${y + r}V${plotHeight}Z`}
                    fill={on ? A.saffronPressed : A.saffron}
                    opacity={focus === null || on ? 1 : 0.55}
                  />
                ) : (
                  <Rect key={i} x={x} y={plotHeight - 1} width={barWidth} height={1} fill={A.lineStrong} />
                );
              })}
            </Svg>
            {/* Hit targets the full height of the plot, wider than the bars. */}
            <View style={[StyleSheet.absoluteFill, styles.hits, { height: plotHeight }]}>
              {data.map((d, i) => (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.detail ?? d.label}: ${d.value}${unit}`}
                  onPress={() => setFocus(focus === i ? null : i)}
                  onHoverIn={() => setFocus(i)}
                  onHoverOut={() => setFocus(null)}
                  style={styles.hit}
                />
              ))}
            </View>
            <View style={styles.axis}>
              {data.map((d, i) => (
                <Text key={i} style={[styles.axisLabel, { width: barWidth + gap }]} numberOfLines={1}>
                  {i % every === 0 || i === data.length - 1 ? d.label : ''}
                </Text>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

/** A ranking: one labelled bar per row, longest first. */
export function RankList({
  data,
  limit = 8,
  unit = '',
  empty = 'Nothing recorded yet.',
}: {
  data: Point[];
  limit?: number;
  unit?: string;
  empty?: string;
}) {
  const rows = data.slice(0, limit);
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <Text style={styles.empty}>{empty}</Text>;
  return (
    <View style={styles.rank}>
      {rows.map((row) => (
        <View key={row.label} style={styles.rankRow} accessible accessibilityLabel={`${row.label}: ${row.value}${unit}`}>
          <View style={styles.rankHead}>
            <Text style={styles.rankLabel} numberOfLines={1}>
              {row.label}
            </Text>
            <Text style={styles.rankValue}>
              {row.value.toLocaleString()}
              {unit}
            </Text>
          </View>
          <View style={styles.rankTrack}>
            <View style={[styles.rankBar, { width: `${Math.max(2, (row.value / max) * 100)}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** A small trend line for a stat tile. */
export function Sparkline({ values, width = 120, height = 28 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(1)} ${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`);
  return (
    <Svg width={width} height={height}>
      <Path d={`M${points.join(' L')}`} stroke={A.saffron} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** A single proportion as a bar — storage used, contrast passed. */
export function Meter({ value, max, tone = A.saffron }: { value: number; max: number; tone?: string }) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={styles.meterTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max, now: value }}>
      <View style={[styles.meterFill, { width: `${ratio * 100}%`, backgroundColor: tone }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  readout: { marginBottom: S.md, gap: 1 },
  readoutValue: { ...T.h1, color: A.ink, fontVariant: ['tabular-nums'] },
  readoutLabel: { ...T.small, color: A.muted },
  hits: { flexDirection: 'row' },
  hit: { flex: 1 },
  axis: { flexDirection: 'row', marginTop: 6 },
  axisLabel: { ...T.small, fontSize: 11, color: A.subtle },
  empty: { ...T.small, color: A.subtle },
  rank: { gap: S.md },
  rankRow: { gap: 5 },
  rankHead: { flexDirection: 'row', justifyContent: 'space-between', gap: S.md },
  rankLabel: { ...T.label, color: A.body, flex: 1 },
  rankValue: { ...T.label, color: A.ink, fontVariant: ['tabular-nums'] },
  rankTrack: { height: 6, borderRadius: R.pill, backgroundColor: A.sunken, overflow: 'hidden' },
  rankBar: { height: 6, borderRadius: R.pill, backgroundColor: A.saffron },
  meterTrack: { height: 8, borderRadius: R.pill, backgroundColor: A.sunken, overflow: 'hidden' },
  meterFill: { height: 8, borderRadius: R.pill },
});
