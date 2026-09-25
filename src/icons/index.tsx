import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
} from 'react-native-svg';

import { colors } from '@/theme';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type ResolvedIcon = { size: number; color: string; strokeWidth: number };

function useStroke({ size = 24, color = colors.ink, strokeWidth = 2 }: IconProps): ResolvedIcon {
  return { size, color, strokeWidth };
}

/* ------------------------------------------------------------------ *
 * Navigation & chrome
 * ------------------------------------------------------------------ */

export function ChevronLeft(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.5, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="15 18 9 12 15 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRight(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="9 18 15 12 9 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** The arrow that ends a text link: "See all →". Drawn short so it reads as a mark, not a button. */
export function ArrowRight(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ size: 16, strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="5" y1="12" x2="18" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Polyline
        points="12 6 18 12 12 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Search(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} />
      <Line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function Home({ filled, ...props }: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3 9.5L12 2.5l9 7V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="9 22 9 12 15 12 15 22"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Speech bubble with three dots — the Chat tab. */
export function ChatDots({ filled, ...props }: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
          fill={color}
        />
        <Circle cx="8" cy="10" r="1.15" fill={colors.white} />
        <Circle cx="12" cy="10" r="1.15" fill={colors.white} />
        <Circle cx="16" cy="10" r="1.15" fill={colors.white} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8.5" cy="11.6" r="1" fill={color} />
      <Circle cx="12.5" cy="11.6" r="1" fill={color} />
      <Circle cx="16.5" cy="11.6" r="1" fill={color} />
    </Svg>
  );
}

export function Phone({ filled, ...props }: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  const d =
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={d}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 1 : strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * A diyo, the clay oil lamp lit at every puja and in every doorway at Tihar:
 * a shallow bowl, the wick at its lip, and the flame.
 */
export function Diya({ filled, ...props }: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.8c1.7 2.1 2.9 3.6 2.9 5.4a2.9 2.9 0 0 1-5.8 0c0-1.8 1.2-3.3 2.9-5.4z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M2.8 13.2h18.4c-.4 3.7-4.4 6.3-9.2 6.3s-8.8-2.6-9.2-6.3z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Line x1="12" y1="11.1" x2="12" y2="13.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="9" y1="21.5" x2="15" y2="21.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * The purna kalash: a water pot with mango leaves and a coconut in its
 * mouth. Setting one up is Ghatasthapana, the first day of Dashain, and one
 * stands at the start of every puja.
 */
export function Kalash(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="7" r="2.7" />
        <Path d="M9.3 9.9C7.6 10 5.7 9.1 4.6 7.4c1.9-.4 3.9.3 5.1 1.7" />
        <Path d="M14.7 9.9c1.7.1 3.6-.8 4.7-2.5-1.9-.4-3.9.3-5.1 1.7" />
        <Path d="M7.6 10.8h8.8" />
        <Path d="M9.2 10.8v1.4C6.4 13.3 5 15.1 5 17.1 5 19.4 7.3 21 10.2 21h3.6c2.9 0 5.2-1.6 5.2-3.9 0-2-1.4-3.8-4.2-4.9v-1.4" />
        <Path d="M5.6 16h12.8" />
      </G>
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Onboarding stepper
 * ------------------------------------------------------------------ */

export function Calendar(props: IconProps) {
  const { size, color, strokeWidth } = useStroke(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth} />
      {[8, 12, 16].map((cx) => (
        <Circle key={`r1-${cx}`} cx={cx} cy="14" r="0.8" fill={color} />
      ))}
      {[8, 12, 16].map((cx) => (
        <Circle key={`r2-${cx}`} cx={cx} cy="18" r="0.8" fill={color} />
      ))}
    </Svg>
  );
}

export function MessageSquare(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Outlined standing male figure used on the gender step. */
export function MaleFigure({ size = 48, color = colors.ink }: IconProps) {
  return (
    <Svg width={size * (32 / 48)} height={size} viewBox="0 0 32 48" fill="none">
      <Circle cx="16" cy="8" r="5" stroke={color} strokeWidth={1.8} />
      <Path
        d="M10 17h12c2.2 0 3.5 1.5 3.5 3.5v11.5c0 .6-.4 1-1 1h-1.5c-.6 0-1-.4-1-1v-8h-1.5v21c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V30h-1v15c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V25H9.5v8c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V20.5C6 18.5 7.8 17 10 17z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Outlined standing female figure used on the gender step. */
export function FemaleFigure({ size = 48, color = colors.ink }: IconProps) {
  return (
    <Svg width={size * (32 / 48)} height={size} viewBox="0 0 32 48" fill="none">
      <Circle cx="16" cy="8" r="5" stroke={color} strokeWidth={1.8} />
      <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M10.5 17h11c1.5 0 2.8 1.1 3.2 2.5l2.2 9.5c.2.8-.4 1.5-1.2 1.5h-1.4c-.7 0-1.2-.5-1.4-1.2L22 24l2 11.5c.1.7-.4 1.5-1.2 1.5H9.2c-.8 0-1.3-.8-1.2-1.5L10 24l-.9 5.3c-.2.7-.7 1.2-1.4 1.2H6.3c-.8 0-1.4-.7-1.2-1.5l2.2-9.5C7.7 18.1 9 17 10.5 17z" />
        <Path d="M13.5 37v7.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V37" />
        <Path d="M21.5 37v7.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V37" />
      </G>
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Home quick categories
 * ------------------------------------------------------------------ */

export function Sunrise(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v3M5.64 6.64l2.12 2.12M18.36 6.64l-2.12 2.12M4 14h16M7 14a5 5 0 0 1 10 0M2 18h20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Close(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Door with an arrow leaving it — signing out of the saved profile. */
export function LogOut(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="16 8 20 12 16 16"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="20" y1="12" x2="10" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** North-Indian style kundli square with the inner diamond. */
export function KundliChart(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="21" y1="3" x2="3" y2="21" stroke={color} strokeWidth={strokeWidth} />
      <Polygon points="12,3 21,12 12,21 3,12" stroke={color} strokeWidth={strokeWidth} fill="none" />
    </Svg>
  );
}

export function Gem(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon
        points="6 3 18 3 22 9 12 21 2 9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Line x1="2" y1="9" x2="22" y2="9" stroke={color} strokeWidth={strokeWidth} />
      <Polyline points="7 9 12 21 17 9" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" />
      <Line x1="6" y1="3" x2="10" y2="9" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="18" y1="3" x2="14" y2="9" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

/** Two linked rings, one set with a stone — kundli milan, matching for marriage. */
export function MatchRings(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8.6" cy="14.6" r="5.6" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="15.4" cy="14.6" r="5.6" stroke={color} strokeWidth={strokeWidth} />
      <Polygon
        points="8.6 4 10.6 6.4 8.6 9 6.6 6.4"
        stroke={color}
        strokeWidth={strokeWidth * 0.85}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function Check(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 3, color: colors.white, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20 6 9 17 4 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Scalloped verified seal with a tick, as used beside astrologer names. */
export function SealCheck({ size = 16, color = colors.green }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.97-.81-4.08s-2.6-1.38-4.08-.81C14.5 2.46 13.25 1.75 12 1.75s-2.5.71-3.17 2.02C7.34 3.2 5.76 3.47 4.75 4.58s-1.27 2.69-.81 4.08C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.97.81 4.08s2.6 1.38 4.08.81c.67 1.31 1.92 2.02 3.17 2.02s2.5-.71 3.17-2.02c1.48.57 3.06.3 4.08-.81s1.27-2.69.81-4.08c1.31-.67 2.19-1.91 2.19-3.34z"
        fill={color}
      />
      <Polyline
        points="7.8 12.2 10.6 15 16.4 9.2"
        stroke={colors.white}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function Star({
  size = 13,
  color = colors.saffron,
  filled = true,
}: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.5l2.9 5.88 6.5.95-4.7 4.58 1.11 6.46L12 17.33l-5.81 3.05 1.11-6.46-4.7-4.58 6.5-.95L12 2.5z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Wallet / header actions
 * ------------------------------------------------------------------ */

export function Headphones(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </G>
    </Svg>
  );
}

/** A lotus: the centre petal upright, one open to each side, on the water line. */
export function Lotus(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 18.5c-2.3-1.4-3.6-3.7-3.6-6.3 0-2.4 1.3-4.8 3.6-7.2 2.3 2.4 3.6 4.8 3.6 7.2 0 2.6-1.3 4.9-3.6 6.3z" />
        <Path d="M10.2 18.3C6.8 18.1 4.1 16 3.2 12.6c1.6-.4 3.3-.3 4.8.4" />
        <Path d="M13.8 18.3c3.4-.2 6.1-2.3 7-5.7-1.6-.4-3.3-.3-4.8.4" />
        <Path d="M4 21h16" />
      </G>
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Chat screen
 * ------------------------------------------------------------------ */

export function Send({ size = 18, color = colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={color} />
    </Svg>
  );
}

export function DoubleCheck({ size = 14, color = colors.green }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17l-4.24-4.24-1.41 1.41 5.66 5.66 12-12-1.43-1.41zM.41 13.41L6.07 19.07l1.41-1.41L1.83 12 .41 13.41z"
        fill={color}
      />
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Services
 *
 * One line weight, one 24-unit box, no fills: these sit in a grid of
 * twenty and any that carried more detail would shout over its neighbours.
 * ------------------------------------------------------------------ */

export function Clock(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Polyline points="12 7 12 12 16 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Palette(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="7.5" cy="11.5" r="1.1" fill={color} />
      <Circle cx="10.5" cy="7.5" r="1.1" fill={color} />
      <Circle cx="15.5" cy="8.5" r="1.1" fill={color} />
    </Svg>
  );
}

export function Numerals(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="9" y1="3" x2="9" y2="21" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="15" y1="3" x2="15" y2="21" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function Compass(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Polygon points="15.5 8.5 10.5 10.5 8.5 15.5 13.5 13.5" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function Swap(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="4 8 20 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Polyline points="16 4 20 8 16 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="20 16 4 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Polyline points="8 12 4 16 8 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Orbit(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Ellipse cx="12" cy="12" rx="10" ry="4.5" stroke={color} strokeWidth={strokeWidth} transform="rotate(-28 12 12)" />
      <Circle cx="20" cy="8.2" r="1.6" fill={color} />
    </Svg>
  );
}

export function QuestionMark(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M9.2 9.2a2.9 2.9 0 1 1 3.6 2.8c-.6.2-.9.7-.9 1.3v.7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
      <Circle cx="12" cy="16.6" r="1" fill={color} />
    </Svg>
  );
}

export function Shield(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3 20 6v6c0 4.4-3.2 8.1-8 9-4.8-.9-8-4.6-8-9V6l8-3Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" />
      <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function DashaWheel(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="12" r="3.4" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="12" y1="3" x2="12" y2="8.6" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="12" y1="15.4" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="3" y1="12" x2="8.6" y2="12" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="15.4" y1="12" x2="21" y2="12" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function Grid(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="17" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="3" y1="9.5" x2="21" y2="9.5" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="8" y1="2.5" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="16" y1="2.5" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1.1" fill={color} />
      <Circle cx="12" cy="14" r="1.1" fill={color} />
      <Circle cx="16" cy="14" r="1.1" fill={color} />
    </Svg>
  );
}

export function Baby(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="5" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="10" cy="7.5" r="0.9" fill={color} />
      <Circle cx="14" cy="7.5" r="0.9" fill={color} />
      <Path d="M10.2 10.2a2.6 2.6 0 0 0 3.6 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
      <Path d="M5 21c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/**
 * Four tiles: "everything the app does". The Services tab; the filled form
 * marks it as the current tab.
 */
export function Apps({ filled, ...props }: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  const tile = { rx: 2, stroke: color, strokeWidth, fill: filled ? color : 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="3.5" width="7" height="7" {...tile} />
      <Rect x="13.5" y="3.5" width="7" height="7" {...tile} />
      <Rect x="3.5" y="13.5" width="7" height="7" {...tile} />
      <Rect x="13.5" y="13.5" width="7" height="7" {...tile} />
    </Svg>
  );
}

/**
 * A crescent moon. Rashifal is read from the moon sign, not the sun sign, so
 * this is the mark for it rather than a star.
 */
export function Moon({ filled, ...props }: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.5 14.2A8.6 8.6 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** The lagna: a sign rising over the eastern horizon. */
export function Ascendant(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 19h18" />
        <Path d="M6 19a6 6 0 0 1 12 0" />
        <Path d="M12 15V3.5M8.5 7 12 3.5 15.5 7" />
      </G>
    </Svg>
  );
}

/** The sun inside a turning arrow: the year, counted from the solar return. */
export function SolarYear(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
        <Path d="M20.5 3v4.5H16" />
        <Circle cx="12" cy="12" r="2.2" />
        <Path d="M12 7.6v.6M12 15.8v.6M7.6 12h.6M15.8 12h.6M8.9 8.9l.4.4M14.7 14.7l.4.4M8.9 15.1l.4-.4M14.7 9.3l.4-.4" />
      </G>
    </Svg>
  );
}

/** A bell: the prediction alerts. */
export function Bell(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6 9a6 6 0 0 1 12 0c0 6.2 2.5 8 2.5 8h-17S6 15.2 6 9z" />
        <Path d="M10.2 20.5a2 2 0 0 0 3.6 0" />
      </G>
    </Svg>
  );
}

/** A written page: one reading, in full. */
export function Reading(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <Path d="M14 3v5h5" />
        <Path d="M8.5 12.5h7M8.5 16.5h4.5" />
      </G>
    </Svg>
  );
}

/** Head and shoulders: your own details. */
export function User(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="8" r="4" />
        <Path d="M4.5 20.5c1-3.6 3.9-5.5 7.5-5.5s6.5 1.9 7.5 5.5" />
      </G>
    </Svg>
  );
}
