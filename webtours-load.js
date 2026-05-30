import { runWebtoursJourney } from './scenarios/webtours.js';

/** Профиль НТ: 3000 входов и 3000 покупок билетов в час (50 итераций/мин). */
const JOURNEYS_PER_HOUR = Number(__ENV.JOURNEYS_PER_HOUR || 3000);
const RATE_PER_MINUTE = JOURNEYS_PER_HOUR / 60;

const SLA_MS = 3000;

const USER_ACTIONS = [
  'getMainPage',
  'getCookies',
  'getUserSession',
  'Login',
  'SearchPage',
  'FlightsPage',
  'ReservationsList',
  'ChooseCitiesAndDates',
  'ChooseFlight',
  'ByTickets',
  'singOff',
  'homePage',
];

function slaThresholds() {
  const thresholds = {
    http_req_failed: ['rate<0.01'],
  };
  for (const name of USER_ACTIONS) {
    thresholds[`http_req_duration{name:${name}}`] = [`p(95)<${SLA_MS}`];
  }
  return thresholds;
}

export const options = {
  scenarios: {
    webtours_peak: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1m',
      preAllocatedVUs: 40,
      maxVUs: 120,
      stages: [
        { duration: '5m', target: RATE_PER_MINUTE },
        { duration: __ENV.STEADY_DURATION || '25m', target: RATE_PER_MINUTE },
        { duration: '2m', target: 0 },
      ],
      exec: 'default',
      tags: { test_type: 'webtours_lt' },
    },
  },
  thresholds: slaThresholds(),
};

export default function () {
  runWebtoursJourney();
}
