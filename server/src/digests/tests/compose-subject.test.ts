import 'reflect-metadata';

import { composeEmailSubject, tokens } from '#root/digests/compose-subject.js';
import { digestNames } from '#root/digests/digest-names.js';
import { DigestSchedule } from '#root/types/enums.js';
import test from 'ava';

const subjects = [
  {
    name: 'default template',
    title: 'Feed Title',
    digestType: DigestSchedule.every3hours,
    template: null,
    result: `Feed Title: ${digestNames.every3hours} digest`,
  },
  {
    name: 'just title',
    title: 'Some Feed Title',
    digestType: DigestSchedule.daily,
    template: tokens.title,
    result: 'Some Feed Title',
  },
  {
    name: 'custom subject (without template tokens)',
    title: 'Some Feed Title',
    digestType: DigestSchedule.daily,
    template: 'My Digest',
    result: 'My Digest',
  },
  {
    name: 'custom subject (with template tokens)',
    title: "Feed's Title",
    digestType: DigestSchedule.daily,
    template: `My ${tokens.title} ${tokens.digestName} digest`,
    result: `My Feed's Title ${digestNames.daily} digest`,
  },
];

subjects.forEach(({ name, title, digestType, template, result }) => {
  test(name, (t) => {
    t.is(composeEmailSubject(title, digestType, template), result);
  });
});
