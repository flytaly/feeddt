import '#root/dotenv.js';
import 'reflect-metadata';

import { Options, User, UserFeed, UserFeedWithOpts } from '#root/db/schema.js';
import { isFeedReady } from '#root/digests/is-feed-ready.js';
import { DigestSchedule } from '#root/types/enums.js';
import test from 'ava';
import sinon from 'sinon';

interface MockSettings {
  digestHour?: number;
  timeZone?: string;
  schedule?: DigestSchedule;
}

type PartialUserFeedWithOpts = Partial<UserFeed> & {
  user: Partial<User> & {
    options: Partial<Options>;
  };
};

function makeMockUserFeed({ digestHour = 18, timeZone = 'UTC', schedule }: MockSettings = {}) {
  const userFeed: PartialUserFeedWithOpts = {
    user: {
      timeZone,
      options: {
        dailyDigestHour: digestHour,
      },
    },
  };
  if (schedule) userFeed.schedule = schedule;
  return userFeed;
}

function ready(uF: PartialUserFeedWithOpts, now: string, prevDigestTime: string) {
  uF.lastDigestSentAt = new Date(prevDigestTime);
  const clock = sinon.useFakeTimers(new Date(now));
  const result = isFeedReady(uF as unknown as UserFeedWithOpts);
  clock.restore();
  return result;
}

test('Hourly digest', (t) => {
  const uF = makeMockUserFeed({ schedule: DigestSchedule.everyhour });
  t.is(ready(uF, '2020-05-30T23:30:00.00Z', '2020-05-30T22:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-30T17:22:00.00Z', '2020-05-30T17:00:00.00Z'), false);
  t.is(ready(uF, '2020-05-30T17:22:00.00Z', '2020-05-30T17:05:00.00Z'), false);
});

test('2-hourly digest', (t) => {
  const uF = makeMockUserFeed({ schedule: DigestSchedule.every2hours });
  t.is(ready(uF, '2020-05-30T23:30:00.00Z', '2020-05-30T21:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-30T17:22:00.00Z', '2020-05-30T16:00:00.00Z'), false);
  t.is(ready(uF, '2020-05-30T17:22:00.00Z', '2020-05-30T16:05:00.00Z'), false);
});

test('3-hourly digest', (t) => {
  const uF = makeMockUserFeed({ schedule: DigestSchedule.every3hours });
  t.is(ready(uF, '2020-05-30T23:30:00.00Z', '2020-05-30T20:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-30T17:22:00.00Z', '2020-05-30T15:00:00.00Z'), false);
  t.is(ready(uF, '2020-05-30T17:22:00.00Z', '2020-05-30T15:05:00.00Z'), false);
});

test('6-hourly digest', (t) => {
  const uF = makeMockUserFeed({ schedule: DigestSchedule.every6hours });
  t.is(ready(uF, '2020-05-30T23:30:00.00Z', '2020-05-30T15:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-30T17:22:00.00Z', '2020-05-30T12:00:00.00Z'), false);
  t.is(ready(uF, '2020-05-30T17:22:00.00Z', '2020-05-30T12:05:00.00Z'), false);
});

test('12-hourly digest', (t) => {
  const uF = makeMockUserFeed({ schedule: DigestSchedule.every12hours });
  t.is(ready(uF, '2020-05-30T23:30:00.00Z', '2020-05-30T11:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-31T04:00:00.00Z', '2020-05-30T12:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-30T23:30:00.00Z', '2020-05-30T12:00:00.00Z'), false);
  t.is(ready(uF, '2020-05-30T23:30:00.00Z', '2020-05-30T12:05:00.00Z'), false);
});

test('daily digest (18:00)', (t) => {
  const uF = makeMockUserFeed({ digestHour: 18, schedule: DigestSchedule.daily });
  t.is(ready(uF, '2020-05-30T19:30:00.00Z', '2020-05-29T04:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-31T18:00:00.00Z', '2020-05-30T18:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-30T23:30:00.00Z', '2020-05-30T18:04:00.00Z'), false);
  t.is(ready(uF, '2020-05-31T16:00:00.00Z', '2020-05-30T18:04:00.00Z'), false);
  t.is(ready(uF, '2020-05-30T22:30:00.00Z', '2020-05-28T19:04:00.00Z'), false, 'too late');
  t.is(ready(uF, '2020-05-31T05:00:00.00Z', '2020-05-30T21:04:00.00Z'), false, 'too late');
  t.is(ready(uF, '2020-06-02T14:00:00.00Z', '2020-05-30T18:04:00.00Z'), false, 'too early');
});

test('daily digest (13:00)', (t) => {
  const uF = makeMockUserFeed({ digestHour: 13, schedule: DigestSchedule.daily });
  t.is(ready(uF, '2020-05-30T13:30:00.00Z', '2020-05-29T13:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-31T14:00:00.00Z', '2020-05-30T18:04:00.00Z'), true);
  t.is(ready(uF, '2020-05-30T18:30:00.00Z', '2020-05-28T19:04:00.00Z'), false, 'too late');
  t.is(ready(uF, '2020-06-02T12:50:00.00Z', '2020-05-30T18:04:00.00Z'), false, 'too early');
});

test('timezone test', (t) => {
  const dateNow = '2020-05-31T15:40:00.00Z';
  const prevDigestTime = '2020-05-30T18:40:00.00Z';
  const uF = makeMockUserFeed({ digestHour: 18, schedule: DigestSchedule.daily });

  uF.user.timeZone = 'Europe/Paris';
  t.is(ready(uF, dateNow, prevDigestTime), false, 'false in Paris (<18:00)');

  uF.user.timeZone = 'Europe/Moscow';
  t.is(ready(uF, dateNow, prevDigestTime), true, 'true in Moscow (>18:00)');
});
