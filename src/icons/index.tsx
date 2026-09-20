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

/** Namaste / folded prayer hands — the Remedies tab. */
export function PrayingHands({ filled, ...props }: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2a1 1 0 0 0-1 1v7.5l-2.2-4.4a1 1 0 0 0-1.78.9l2.88 5.75A2 2 0 0 0 11.69 14H12v8h2v-8h.31a2 2 0 0 0 1.79-1.25l2.88-5.75a1 1 0 0 0-1.78-.9L15 10.5V3a1 1 0 0 0-1-1h-2z"
          fill={color}
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 4c-1.5 2-2 5-2 9v7h4v-7c0-4-.5-7-2-9z" />
        <Path d="M7 11c-.5 1.5-1 3-1 6v3h3" />
        <Path d="M17 11c.5 1.5 1 3 1 6v3h-3" />
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

/** Sunset: the sunrise mark with the arrow pointing back down. */
export function Close(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
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
      <Path d="M19 2l.5 1.5L21 4l-1.5.5L19 6l-.5-1.5L17 4l1.5-.5z" fill={color} />
      <Path d="M4 1.5l.3 1 .9.3-.9.3-.3 1-.3-1-.9-.3.9-.3z" fill={color} />
    </Svg>
  );
}

/** Two interlinked rings — kundli matching. */
export function MatchRings(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8.5" cy="13.5" r="5" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="15.5" cy="13.5" r="5" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8.5 7L7.5 8.5H9.5L8.5 7Z" fill={color} />
    </Svg>
  );
}

/** Reader with an open book — astrology blog. */
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

export function Lotus(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 3c-1.5 3-4 6-4 9a4 4 0 0 0 8 0c0-3-2.5-6-4-9z" />
        <Path d="M6 13a4.5 4.5 0 0 0 6 4.5" />
        <Path d="M18 13a4.5 4.5 0 0 1-6 4.5" />
        <Path d="M12 17.5V21" />
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
 * Remedies hero feature marks
 * ------------------------------------------------------------------ */

