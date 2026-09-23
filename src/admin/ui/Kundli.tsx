import React from 'react';
import Svg, { Polygon, Rect } from 'react-native-svg';

import type { ConfigArea } from '@/config/schema';

import { HOUSE_AREAS } from '../nav';
import { KUNDLI_HOUSES } from './icons';
import { A } from './theme';

/**
 * The kundli mark. Drawn quiet, it is the dashboard's logo; given the list
 * of changed areas, each house whose part of the app has unpublished edits
 * fills with saffron.
 */
export function KundliMark({
  size = 28,
  dirty = [],
  line = A.brass,
  fill = 'transparent',
  lit = A.saffron,
}: {
  size?: number;
  dirty?: ConfigArea[];
  line?: string;
  fill?: string;
  lit?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="-2 -2 104 104">
      <Rect x={0} y={0} width={100} height={100} fill={fill} stroke={line} strokeWidth={4} rx={4} />
      {KUNDLI_HOUSES.map((house, index) => {
        const on = HOUSE_AREAS[index].areas.some((area) => dirty.includes(area));
        return (
          <Polygon
            key={index}
            points={house.points}
            fill={on ? lit : 'transparent'}
            stroke={line}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
}

/** Which houses are lit, in words — for the indicator's label. */
export function dirtySummary(dirty: ConfigArea[]): string {
  const lit = HOUSE_AREAS.filter((house) => house.areas.some((area) => dirty.includes(area)));
  if (!lit.length) return 'Everything is published';
  if (lit.length === 1) return `Unpublished changes in ${lit[0].label}`;
  return `Unpublished changes in ${lit.length} parts of the app`;
}
