import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * True when the OS "Reduce Motion" setting is on.
 *
 * Every animated component in the app reads this and falls back to an
 * instant state change, so the motion is decoration rather than a
 * requirement for understanding the screen.
 */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!cancelled) setReduce(enabled);
      })
      .catch(() => {
        // Unsupported platform: assume motion is fine.
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReduce(enabled),
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return reduce;
}
