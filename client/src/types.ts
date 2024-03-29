export enum DigestSchedule {
  // realtime = 'realtime',
  everyhour = 'everyhour',
  every2hours = 'every2hours',
  every3hours = 'every3hours',
  every6hours = 'every6hours',
  every12hours = 'every12hours',
  daily = 'daily',
}
export const DigestDisable = 'disable';

export const periodNames: Record<DigestSchedule | 'realtime' | 'disable', string> = {
  realtime: 'realtime',
  everyhour: 'hourly',
  every2hours: '2-hourly',
  every3hours: '3-hourly',
  every6hours: '6-hourly',
  every12hours: '12-hourly',
  daily: 'daily',
  disable: 'disabled',
};

export type PathHistory = { currentPath: string; prevPath: string };

export const periodToNum: Record<DigestSchedule | 'disable' | 'realtime', number> = {
  realtime: 0,
  everyhour: 1,
  every2hours: 2,
  every3hours: 3,
  every6hours: 6,
  every12hours: 12,
  daily: 24,
  disable: Infinity,
};
