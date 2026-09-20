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

export function Hamburger(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.3, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
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

export function Edit(props: IconProps) {
  const { size, color, strokeWidth } = useStroke(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Bottom tab bar
 * ------------------------------------------------------------------ */

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

export function UserOutline(props: IconProps) {
  const { size, color, strokeWidth } = useStroke(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function GenderPin(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.5, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9" r="5" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 14v7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

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

export function Clock(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Polyline
        points="12 7 12 12 15 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MapPin(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} />
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
export function MaleFigure({ size = 48, color = '#2D2D2D' }: IconProps) {
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
export function FemaleFigure({ size = 48, color = '#2D2D2D' }: IconProps) {
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
export function Sunset(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2v5M9.5 4.5L12 7l2.5-2.5M4 14h16M7 14a5 5 0 0 1 10 0M2 18h20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Waxing crescent, used for the tithi cell of the panchang strip. */
export function Moon(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Small cross used to clear the home search field. */
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
export function BlogReader(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x="9" y="14" width="6" height="5" rx="1" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M10 16l2 1 2-1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Directory filter chips
 * ------------------------------------------------------------------ */

export function Sliders(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
        <Line x1="4" y1="21" x2="4" y2="14" />
        <Line x1="4" y1="10" x2="4" y2="3" />
        <Line x1="12" y1="21" x2="12" y2="12" />
        <Line x1="12" y1="8" x2="12" y2="3" />
        <Line x1="20" y1="21" x2="20" y2="16" />
        <Line x1="20" y1="12" x2="20" y2="3" />
        <Line x1="1" y1="14" x2="7" y2="14" />
        <Line x1="9" y1="8" x2="15" y2="8" />
        <Line x1="17" y1="16" x2="23" y2="16" />
      </G>
    </Svg>
  );
}

export function GridSquares({ size = 24, color = colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} />
      <Rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} />
      <Rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} />
      <Rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} />
    </Svg>
  );
}

export function GridOutline(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function TarotCards(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 6h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function PalmHand(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v3" />
        <Path d="M14 9V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7" />
        <Path d="M10 10V5a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
        <Path d="M18 11a4 4 0 0 1 4 4v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </G>
    </Svg>
  );
}

/* ------------------------------------------------------------------ *
 * Badges & status
 * ------------------------------------------------------------------ */

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
  color = '#57534E',
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

export function Wallet(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="14" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M16 13a2 2 0 0 1 0-4h6v4z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path
        d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function Plus(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2.4, color: colors.white, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Messenger-style lightning bubble in the directory header. */
export function MessengerBubble({ size = 22, color = colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.3 2 2 6.2 2 11.7c0 3.1 1.4 5.9 3.7 7.7v3.1l3.4-1.9c.9.25 1.9.4 2.9.4 5.7 0 10-4.2 10-9.3S17.7 2 12 2z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinejoin="round"
      />
      <Path d="M6.6 14.6l4.2-4.4 2.2 2.2 3.5-2.2-4.2 4.4-2.2-2.2-3.5 2.2z" fill={color} />
    </Svg>
  );
}

export function History(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <Path d="M3 3v5h5" />
        <Path d="M12 7v5l3 2" />
      </G>
    </Svg>
  );
}

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

export function Users(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <Circle cx="9" cy="7" r="4" />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </G>
    </Svg>
  );
}

export function Gift(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 2, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="20 12 20 22 4 22 4 12" />
        <Rect x="2" y="7" width="20" height="5" />
        <Line x1="12" y1="22" x2="12" y2="7" />
        <Path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <Path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </G>
    </Svg>
  );
}

/** Lotus / diya — "Book a Pooja". */
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

export function DoubleCheck({ size = 14, color = '#3B82F6' }: IconProps) {
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

export function Shield(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Meditate(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M6 19c0-3 3-5 6-5s6 2 6 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function Grounding(props: IconProps) {
  const { size, color, strokeWidth } = useStroke({ strokeWidth: 1.8, ...props });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Ram silhouette used as the default Aries profile avatar. */
export function AriesAvatar({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#F2DE4E" />
      <Path d="M22 100 C22 80, 78 80, 78 100 Z" fill="#D49A32" />
      <Rect x="43" y="66" width="14" height="15" fill="#E8B58E" />
      <Ellipse cx="50" cy="54" rx="19" ry="21" fill="#E8B58E" />
      <Path d="M32 45 C32 32, 68 32, 68 45 C68 38, 32 38, 32 45 Z" fill="#4B3621" />
      <Path
        d="M33 42 C18 35, 15 56, 26 62 C34 66, 38 52, 28 50 C23 48, 22 40, 31 43"
        fill="#9DA5AF"
        stroke="#7E8793"
        strokeWidth={1.2}
      />
      <Path
        d="M67 42 C82 35, 85 56, 74 62 C66 66, 62 52, 72 50 C77 48, 78 40, 69 43"
        fill="#9DA5AF"
        stroke="#7E8793"
        strokeWidth={1.2}
      />
      <Ellipse cx="43" cy="52" rx="2.5" ry="1.8" fill="#36220F" />
      <Ellipse cx="57" cy="52" rx="2.5" ry="1.8" fill="#36220F" />
      <Path d="M50 52 L48 57 L52 57" fill="none" stroke="#C58D66" strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M46 63 Q50 66 54 63" fill="none" stroke="#B86659" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Rudraksha & Karungali mala on its wooden stand — the artwork in the
 * AstroRemedy hero banner. Beads are placed along two strands so the shape
 * reads as a mala rather than loose dots.
 */
export function MalaArt({ width = 190, height = 170 }: { width?: number; height?: number }) {
  // Dark Karungali strand, looping from the stand down to the right.
  const karungali: [number, number, number][] = [
    [96, 40, 7], [108, 34, 7.5], [121, 33, 8], [134, 37, 8.5], [144, 46, 9],
    [150, 58, 9.5], [151, 71, 9.5], [147, 84, 9], [138, 93, 8.5], [126, 98, 8],
    [113, 98, 7.5], [101, 93, 7],
  ];
  // Warmer Rudraksha beads gathered at the base.
  const rudraksha: [number, number, number][] = [
    [96, 120, 11], [118, 124, 12.5], [140, 119, 10],
  ];

  return (
    <Svg width={width} height={height} viewBox="0 0 190 170">
      {/* Wooden stand */}
      <Rect x="70" y="16" width="9" height="116" rx="4.5" fill="#B89B72" />
      <Ellipse cx="74.5" cy="136" rx="30" ry="8" fill="#C4A87F" />
      <Ellipse cx="74.5" cy="132" rx="30" ry="8" fill="#D8BF99" />

      {/* Hanging strand hint */}
      <Path
        d="M79 34 C62 52, 60 100, 92 118"
        stroke="#7A6544"
        strokeWidth={2}
        strokeDasharray="5 6"
        strokeLinecap="round"
        fill="none"
      />

      {karungali.map(([cx, cy, r], i) => (
        <Circle key={`k${i}`} cx={cx} cy={cy} r={r} fill="#272523" stroke="#0F0E0D" strokeWidth={0.8} />
      ))}
      {rudraksha.map(([cx, cy, r], i) => (
        <Circle key={`r${i}`} cx={cx} cy={cy} r={r} fill="#8B4A1C" stroke="#5C2F10" strokeWidth={1} />
      ))}
    </Svg>
  );
}
