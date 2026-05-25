import http from 'k6/http';
import { check } from 'k6';

const LOAD_STAGES = [
  { duration: '5m', targetPercent: 1.0 },
  { duration: '10m', targetPercent: 1.0 },
  { duration: '5m', targetPercent: 1.2 },
  { duration: '10m', targetPercent: 1.2 },
];

function buildStages(baseRatePerMinute) {
  return LOAD_STAGES.map(({ duration, targetPercent }) => ({
    duration,
    target: Math.round(baseRatePerMinute * targetPercent),
  }));
}

export const options = {
  scenarios: {
    ya_ru: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1m',
      preAllocatedVUs: 10,
      maxVUs: 50,
      stages: buildStages(60),
      exec: 'yaRu',
      tags: { scenario: 'ya_ru' },
    },
    www_ru: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1m',
      preAllocatedVUs: 20,
      maxVUs: 100,
      stages: buildStages(120),
      exec: 'wwwRu',
      tags: { scenario: 'www_ru' },
    },
  },
};

export function yaRu() {
  const res = http.get('https://ya.ru', {
    tags: { name: 'ya_ru' },
  });

  check(res, {
    'ya.ru status is 200': (r) => r.status === 200,
  });
}

export function wwwRu() {
  const res = http.get('http://www.ru', {
    tags: { name: 'www_ru' },
  });

  check(res, {
    'www.ru status is 200': (r) => r.status === 200,
  });
}
