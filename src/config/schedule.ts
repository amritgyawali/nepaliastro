import type { Schedule } from './schema';

export type ScheduleState = 'always' | 'upcoming' | 'running' | 'ended';

/** Where a banner or popup is in its dates. 0 means "no limit" at that end. */
export function scheduleState(schedule: Schedule, now = Date.now()): ScheduleState {
  if (schedule.startsAt && now < schedule.startsAt) return 'upcoming';
  if (schedule.endsAt && now > schedule.endsAt) return 'ended';
  if (!schedule.startsAt && !schedule.endsAt) return 'always';
  return 'running';
}

/** True when something with these dates should be on screen now. */
export function isLive(schedule: Schedule, now = Date.now()): boolean {
  const state = scheduleState(schedule, now);
  return state === 'always' || state === 'running';
}
