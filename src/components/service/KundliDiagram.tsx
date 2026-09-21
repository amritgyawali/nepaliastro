import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { colors, font } from '@/theme';

export type DiagramHouse = {
  /** 1–12, counted from the lagna. */
  house: number;
  /** Sign number 1–12 printed small in the corner of the cell. */
  rashiNumber: number;
  /** Two-letter graha tags, e.g. ["Su", "Me"]. */
  grahas: string[];
  /** Marks a graha as retrograde, by the same tag. */
  retrograde?: string[];
};

type KundliDiagramProps = {
  houses: DiagramHouse[];
  size?: number;
  /** Printed under the first house, e.g. "D1" or "Navamsa". */
  caption?: string;
};

/**
 * Where each house's label sits, as a fraction of the square.
 *
 * The North Indian chart is a fixed frame: house one is always the top
 * centre and the houses run anticlockwise from it, so it is the *signs* that
 * move between charts, not the houses. That is the opposite of the South
 * Indian form, and it is the one a Nepali reader expects to see, which is
 * why the sign number is printed in each cell — without it the chart cannot
 * be read at all.
 */
const ANCHORS: Record<number, { x: number; y: number }> = {
  1: { x: 0.5, y: 0.22 },
  2: { x: 0.25, y: 0.085 },
  3: { x: 0.085, y: 0.25 },
  4: { x: 0.25, y: 0.5 },
  5: { x: 0.085, y: 0.75 },
  6: { x: 0.25, y: 0.915 },
  7: { x: 0.5, y: 0.72 },
  8: { x: 0.75, y: 0.915 },
  9: { x: 0.915, y: 0.75 },
  10: { x: 0.75, y: 0.5 },
  11: { x: 0.915, y: 0.25 },
  12: { x: 0.75, y: 0.085 },
};

/**
 * The birth chart, drawn.
 *
 * A square, its two diagonals, and a diamond joining the midpoints of the
 * sides — twelve compartments, and the whole of a chart on one screen.
 */
export function KundliDiagram({ houses, size = 300, caption }: KundliDiagramProps) {
  const s = size;
  const half = s / 2;
  const stroke = colors.saffronBorder;

  const byHouse = new Map(houses.map((h) => [h.house, h]));

  return (
    <View style={styles.root}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Rect x={0.5} y={0.5} width={s - 1} height={s - 1} fill={colors.white} stroke={stroke} strokeWidth={1.5} />

        {/* The two diagonals. */}
        <Line x1={0} y1={0} x2={s} y2={s} stroke={stroke} strokeWidth={1} />
        <Line x1={s} y1={0} x2={0} y2={s} stroke={stroke} strokeWidth={1} />

        {/* The diamond through the midpoints of the four sides. */}
        <G>
          <Line x1={half} y1={0} x2={s} y2={half} stroke={stroke} strokeWidth={1} />
          <Line x1={s} y1={half} x2={half} y2={s} stroke={stroke} strokeWidth={1} />
          <Line x1={half} y1={s} x2={0} y2={half} stroke={stroke} strokeWidth={1} />
          <Line x1={0} y1={half} x2={half} y2={0} stroke={stroke} strokeWidth={1} />
        </G>

        {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
          const data = byHouse.get(house);
          const anchor = ANCHORS[house];
          const cx = anchor.x * s;
          const cy = anchor.y * s;
          const grahas = data?.grahas ?? [];

          // The tags stack downward from the sign number; with four or more
          // in one house the type steps down so nothing crosses a line.
          const fontSize = grahas.length >= 4 ? s * 0.035 : s * 0.042;
          const lineHeight = fontSize * 1.25;
          const startY = cy + fontSize * 0.5;

          return (
            <G key={house}>
              <SvgText
                x={cx}
                y={cy - fontSize * 0.55}
                fontSize={s * 0.036}
                fontFamily={font.semibold}
                fill={colors.saffronDeep}
                textAnchor="middle"
              >
                {data ? `${data.rashiNumber}` : ''}
              </SvgText>

              {grahas.map((tag, index) => (
                <SvgText
                  key={tag + index}
                  x={cx}
                  y={startY + index * lineHeight}
                  fontSize={fontSize}
                  fontFamily={font.medium}
                  fill={colors.ink}
                  textAnchor="middle"
                >
                  {data?.retrograde?.includes(tag) ? `${tag}ᴿ` : tag}
                </SvgText>
              ))}
            </G>
          );
        })}

        {caption ? (
          <SvgText
            x={half}
            y={half + s * 0.015}
            fontSize={s * 0.038}
            fontFamily={font.medium}
            fill={colors.subtle}
            textAnchor="middle"
          >
            {caption}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
});
