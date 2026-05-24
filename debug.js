import { runWebtoursJourney } from './scenarios/webtours.js';

export const options = {
  scenarios: {
    debug: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '10s',
    },
  },
};

export default function () {
  runWebtoursJourney();
}
