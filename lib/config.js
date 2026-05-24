export const BASE_URL = __ENV.BASE_URL || 'http://webtours.load-test.ru:1080';

export const DEFAULT_HEADERS = {
  'Accept-Encoding': 'gzip, deflate',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

export const LOGIN = {
  username: __ENV.WEBTOURS_USER || 'bilbo',
  password: __ENV.WEBTOURS_PASSWORD || 'riddle',
};

export function httpParams(tags = {}) {
  return {
    headers: DEFAULT_HEADERS,
    tags: { app: 'webtours', ...tags },
  };
}
