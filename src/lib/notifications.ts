/**
 * Delivering the five-hourly reading.
 *
 * These are local notifications: the readings for the next day are written
 * while the app is open and handed to the operating system with the instant
 * each one should appear. That keeps the whole feature working without a
 * server, a push token or an account — and it is why the app tops the
 * schedule up every time it comes back to the foreground.
 *
 * Everything here is a no-op on the web, where a scheduled local notification
 * has no equivalent; the readings themselves still appear in the app.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { colors } from '@/theme';

import type { Prediction } from './predictions';

/** Notifications are only scheduled on the two platforms that have them. */
export const notificationsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

/** The Android channel the readings arrive on, so they can be muted alone. */
const CHANNEL_ID = 'daily-prediction';

/** The key the tap handler reads back off a delivered notification. */
export const PREDICTION_ID_KEY = 'predictionId';

/**
 * How a reading behaves when it lands while the app is open: it still shows,
 * because the whole point is the nudge, but it never touches the badge.
 */
export function configureNotificationHandler(): void {
  if (!notificationsSupported) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** The channel has to exist before anything is scheduled against it. */
async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Today’s prediction',
    description: 'Your reading, every five hours, from your own kundli.',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: colors.saffron,
  });
}

export type PermissionState = 'granted' | 'denied' | 'unsupported';

/** Asks once, and reports what the system said. */
export async function ensurePermission(): Promise<PermissionState> {
  if (!notificationsSupported) return 'unsupported';

  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      await ensureChannel();
      return 'granted';
    }

    // `canAskAgain` is false once the person has said no for good; asking
    // again then just returns the same answer without showing anything.
    if (!current.canAskAgain) return 'denied';

    const asked = await Notifications.requestPermissionsAsync();
    if (!asked.granted) return 'denied';

    await ensureChannel();
    return 'granted';
  } catch {
    return 'denied';
  }
}

/** Without asking — used to show the current state in the settings screen. */
export async function permissionState(): Promise<PermissionState> {
  if (!notificationsSupported) return 'unsupported';
  try {
    const current = await Notifications.getPermissionsAsync();
    return current.granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

export async function cancelScheduled(): Promise<void> {
  if (!notificationsSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nothing scheduled, or the module is unavailable — either way, done.
  }
}

/**
 * Replaces the schedule with one notification per future reading.
 *
 * Cancelling everything first is deliberate: a reading can be rewritten when
 * the app reconnects to the AI, and the operating system has no way to edit a
 * pending notification. Returns how many are now queued.
 */
export async function syncSchedule(predictions: Prediction[]): Promise<number> {
  if (!notificationsSupported) return 0;

  await cancelScheduled();
  await ensureChannel();

  const now = Date.now();
  // A notification due in the next few seconds would fire before the schedule
  // is finished being written, so the cutoff sits a minute out.
  const due = predictions
    .filter((prediction) => prediction.at > now + 60_000)
    .sort((a, b) => a.at - b.at);

  let queued = 0;
  for (const prediction of due) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: prediction.title,
          body: prediction.preview,
          data: { [PREDICTION_ID_KEY]: prediction.id },
          color: colors.saffron,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(prediction.at),
          channelId: CHANNEL_ID,
        },
      });
      queued += 1;
    } catch {
      // One that will not schedule should not cost the rest of the day.
    }
  }

  return queued;
}

/** "Send me one now" — the same reading, delivered immediately. */
export async function presentNow(prediction: Prediction): Promise<boolean> {
  if (!notificationsSupported) return false;

  try {
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: prediction.title,
        body: prediction.preview,
        data: { [PREDICTION_ID_KEY]: prediction.id },
        color: colors.saffron,
        sound: 'default',
      },
      // A couple of seconds out rather than `null`: an immediate trigger is
      // swallowed on Android while the app is in the foreground.
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: CHANNEL_ID,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/** The reading id carried by a tapped notification, if it carries one. */
export function predictionIdOf(response: Notifications.NotificationResponse | null): string | null {
  const data = response?.notification.request.content.data as
    | Record<string, unknown>
    | undefined;
  const id = data?.[PREDICTION_ID_KEY];
  return typeof id === 'string' && id.length > 0 ? id : null;
}

export { Notifications };
