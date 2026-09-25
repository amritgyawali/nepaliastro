import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { A } from './theme';

/**
 * The dashboard's icons: 24-unit outline glyphs, drawn as path data so the
 * whole set is one small table rather than a component per icon.
 */

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const rect = (x: number, y: number, w: number, h: number, r = 2) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

const PATHS = {
  overview: `${rect(3, 3, 7, 8, 1.5)} ${rect(14, 3, 7, 5, 1.5)} ${rect(14, 12, 7, 9, 1.5)} ${rect(3, 15, 7, 6, 1.5)}`,
  tools: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z',
  flag: 'M4 22V4 M4 4h13l-2.5 4.5L17 13H4',
  palette: `M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4.5-4.5 4.5H15a2 2 0 0 0-1.4 3.4c.4.4.6.9.6 1.4 0 .4-.9.7-2.2.7z ${circle(7.5, 11, 1)} ${circle(10.5, 7, 1)} ${circle(15, 7.5, 1)}`,
  type: 'M4 7V4h16v3 M9 20h6 M12 4v16',
  ruler: `${rect(3, 3, 18, 18, 2)} M9 3v18 M9 9h12`,
  home: 'M3 10.5 12 3l9 7.5 M5 9v12h14V9 M10 21v-6h4v6',
  menu: 'M4 6h16 M4 12h16 M4 18h10',
  phone: `${rect(6, 2, 12, 20, 2.5)} M11 18h2`,
  page: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h5',
  apps: `${rect(3.5, 3.5, 7, 7, 2)} ${rect(13.5, 3.5, 7, 7, 2)} ${rect(3.5, 13.5, 7, 7, 2)} ${rect(13.5, 13.5, 7, 7, 2)}`,
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z',
  diyo: 'M12 3c1.8 2.6 3.2 4 3.2 6.2a3.2 3.2 0 0 1-6.4 0C8.8 7 10.2 5.6 12 3z M4 14h16l-2 4.5a3 3 0 0 1-2.7 1.5H8.7A3 3 0 0 1 6 18.5z',
  image: `${rect(3, 3, 18, 18, 2)} ${circle(9, 9, 2)} M21 15l-5-5L5 21`,
  text: 'M4 20 10 4h4l6 16 M7 14h10',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h2l6 4V6L6 10H4a1 1 0 0 0-1 1z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12',
  // AI Baba is an astrologer in the app, not a machine, so his mark is a
  // speech bubble with a lamp in it rather than the usual robot head.
  aiBaba: 'M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M12 8.5c.9 1.2 1.5 1.8 1.5 2.7a1.5 1.5 0 0 1-3 0c0-.9.6-1.5 1.5-2.7z',
  chart: 'M3 3v18h18 M8 17v-5 M13 17V8 M18 17v-8',
  users: `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 ${circle(9, 7, 4)} M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8`,
  key: `${circle(7.5, 15.5, 4.5)} M10.7 12.3 21 2 M16 7l3 3 M19 4l2 2`,
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5 M12 7v5l3 3',
  send: 'M12 19V6 M6 11l6-6 6 6 M5 21h14',
  sliders: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  user: `${circle(12, 12, 10)} ${circle(12, 10, 3)} M6.7 18.7a6 6 0 0 1 10.6 0`,
  search: `${circle(11, 11, 7)} M21 21l-4.3-4.3`,
  chat: 'M21 12a8 8 0 0 1-11.5 7.2L4 20.5l1.3-5A8 8 0 1 1 21 12z',
  message: 'M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1z M8 9h8 M8 13h5',
  grid: `${rect(3, 3, 18, 18, 2)} M3 9h18 M3 15h18 M9 3v18 M15 3v18`,
  close: 'M18 6 6 18 M6 6l12 12',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6',
  edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  copy: `${rect(9, 9, 13, 13, 2)} M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1`,
  up: 'M18 15l-6-6-6 6',
  down: 'M6 9l6 6 6-6',
  left: 'M15 18l-6-6 6-6',
  right: 'M9 18l6-6-6-6',
  eye: `M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z ${circle(12, 12, 3)}`,
  eyeOff: 'M3 3l18 18 M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2 M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6 M9.9 9.9a3 3 0 0 0 4.2 4.2',
  check: 'M20 6 9 17l-5-5',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  refresh: 'M21 12a9 9 0 1 1-2.6-6.4L21 8 M21 3v5h-5',
  lock: `${rect(5, 11, 14, 10, 2)} M8 11V7a4 4 0 0 1 8 0v4`,
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  external: 'M15 3h6v6 M10 14 21 3 M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  warning: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
  info: `${circle(12, 12, 10)} M12 16v-4 M12 8h.01`,
  more: `${circle(5, 12, 1)} ${circle(12, 12, 1)} ${circle(19, 12, 1)}`,
  calendar: `${rect(3, 4, 18, 18, 2)} M16 2v4 M8 2v4 M3 10h18`,
  clock: `${circle(12, 12, 10)} M12 6v6l4 2`,
  shuffle: 'M16 3h5v5 M4 20 21 3 M21 16v5h-5 M15 15l6 6 M4 4l5 5',
  sun: `${circle(12, 12, 4)} M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M6.3 17.7l-1.4 1.4 M19.1 4.9l-1.4 1.4`,
  globe: `${circle(12, 12, 10)} M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20`,
  bolt: 'M13 2 3 14h9l-1 8 10-12h-9z',
  filter: 'M22 3H2l8 9.5V19l4 2v-8.5z',
  play: 'M6 4l14 8-14 8z',
  stop: rect(6, 6, 12, 12, 2),
  code: 'M16 18l6-6-6-6 M8 6l-6 6 6 6',
  cloud: 'M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z',
  pulse: 'M22 12h-4l-3 9L9 3l-3 9H2',
  database: 'M4 5c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  grip: `${circle(9, 6, 1)} ${circle(9, 12, 1)} ${circle(9, 18, 1)} ${circle(15, 6, 1)} ${circle(15, 12, 1)} ${circle(15, 18, 1)}`,
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  toggle: `${rect(2, 6, 20, 12, 6)} ${circle(16, 12, 3)}`,
  layers: 'M12 2 2 7l10 5 10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  hash: 'M4 9h16 M4 15h16 M10 3 8 21 M16 3l-2 18',
  kundli: `${rect(3, 3, 18, 18, 1)} M3 3l18 18 M21 3 3 21 M12 3l9 9-9 9-9-9z`,
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.9 1.9 0 0 0 3.4 0',
  mail: `${rect(2, 4, 20, 16, 2)} M22 7l-10 6L2 7`,
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z M7 7h.01',
  coins: `${circle(8, 8, 6)} M18.1 10.4A6 6 0 1 1 10.3 18 M7 6h1v4 M16.7 13.9l.7.7-2.8 2.8`,
  heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
  split: 'M16 3h5v5 M8 3H3v5 M12 22v-8.3a4 4 0 0 0-1.2-2.9L3 3 M15 9l6-6',
} as const;

export type AdminIconName = keyof typeof PATHS;

export function AIcon({
  name,
  size = 20,
  color = A.body,
  strokeWidth = 1.8,
}: {
  name: AdminIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={PATHS[name]}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * The dashboard's mark and its change indicator in one: a North Indian
 * kundli, whose twelve houses stand for the twelve parts of the app a draft
 * can change. A house fills with saffron while that part has unpublished
 * edits, so the chart in the corner says at a glance how much is waiting.
 */
export const KUNDLI_HOUSES: { points: string; cx: number; cy: number }[] = (() => {
  // The classic layout on a 0–100 square: four diamonds in the middle
  // (houses 1, 4, 7, 10) and eight triangles around the edge.
  const houses = [
    { points: '50,0 25,25 50,50 75,25', cx: 50, cy: 25 },
    { points: '0,0 50,0 25,25', cx: 25, cy: 9 },
    { points: '0,0 25,25 0,50', cx: 9, cy: 25 },
    { points: '0,50 25,25 50,50 25,75', cx: 25, cy: 50 },
    { points: '0,50 25,75 0,100', cx: 9, cy: 75 },
    { points: '0,100 25,75 50,100', cx: 25, cy: 91 },
    { points: '50,100 25,75 50,50 75,75', cx: 50, cy: 75 },
    { points: '50,100 75,75 100,100', cx: 75, cy: 91 },
    { points: '100,100 75,75 100,50', cx: 91, cy: 75 },
    { points: '100,50 75,75 50,50 75,25', cx: 75, cy: 50 },
    { points: '100,50 75,25 100,0', cx: 91, cy: 25 },
    { points: '100,0 75,25 50,0', cx: 75, cy: 9 },
  ];
  return houses;
})();
