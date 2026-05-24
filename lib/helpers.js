import { check } from 'k6';

export function assertStatus200(res, stepName) {
  check(res, {
    [`${stepName} status is 200`]: (r) => r.status === 200,
  });
  return res;
}

export function extractMsoCookie(res) {
  const raw = res.headers['Set-Cookie'];
  const header = Array.isArray(raw) ? raw.join('; ') : raw || '';
  const match = header.match(/MSO=([^;]+)/);
  return match ? `MSO=${match[1]}` : '';
}

export function extractInputValue(html, name) {
  const re = new RegExp(`<input[^>]*name="${name}"[^>]*value="([^"]*)"`, 'i');
  const match = html.match(re);
  return match ? match[1] : '';
}

export function extractRandom(regex, text) {
  const re = typeof regex === 'string' ? new RegExp(regex, 'g') : regex;
  const values = [];
  let match = re.exec(text);
  while (match !== null) {
    values.push(match[1]);
    match = re.exec(text);
  }
  if (values.length === 0) {
    return null;
  }
  return values[Math.floor(Math.random() * values.length)];
}
