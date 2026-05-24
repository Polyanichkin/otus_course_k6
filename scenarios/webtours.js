import http from 'k6/http';
import { group } from 'k6';
import { BASE_URL, LOGIN, httpParams } from '../lib/config.js';
import {
  assertStatus200,
  extractMsoCookie,
  extractInputValue,
  extractRandom,
} from '../lib/helpers.js';

const OPTION_VALUE_RE = '<option[^>]*value="([^"]+)">';
const OUTBOUND_FLIGHT_RE = 'name="outboundFlight" value="([^"]+)"';


export function runWebtoursJourney() {
  let msoCookie = '';
  let userSession = '';
  let cityDepart = '';
  let cityArrive = '';
  let randomFlight = '';
  let firstName = '';
  let lastName = '';
  let address1 = '';
  let address2 = '';
  let pass1 = '';
  let creditCard = '';
  let expDate = '';

  group('Open main page and login', () => {
    let res = http.get(`${BASE_URL}/webtours/`, httpParams({ name: 'getMainPage' }));
    assertStatus200(res, 'getMainPage');

    res = http.get(
      `${BASE_URL}/cgi-bin/welcome.pl?signOff=true`,
      httpParams({ name: 'getCookies' }),
    );
    assertStatus200(res, 'getCookies');
    msoCookie = extractMsoCookie(res);

    res = http.get(`${BASE_URL}/cgi-bin/nav.pl?in=home`, {
      ...httpParams({ name: 'getUserSession' }),
      headers: {
        ...httpParams().headers,
        Cookie: msoCookie,
      },
    });
    assertStatus200(res, 'getUserSession');
    userSession = extractInputValue(res.body, 'userSession');

    res = http.post(
      `${BASE_URL}/cgi-bin/login.pl`,
      {
        userSession,
        username: LOGIN.username,
        password: LOGIN.password,
      },
      httpParams({ name: 'Login' }),
    );
    assertStatus200(res, 'Login');
  });

  group('Open flights page and choose flight', () => {
    let res = http.get(
      `${BASE_URL}/cgi-bin/nav.pl?page=search`,
      httpParams({ name: 'SearchPage' }),
    );
    assertStatus200(res, 'SearchPage');

    res = http.get(
      `${BASE_URL}/cgi-bin/nav.pl?page=menu&in=flights`,
      httpParams({ name: 'FlightsPage' }),
    );
    assertStatus200(res, 'FlightsPage');

    res = http.get(
      `${BASE_URL}/cgi-bin/reservations.pl?page=welcome`,
      httpParams({ name: 'ReservationsList' }),
    );
    assertStatus200(res, 'ReservationsList');
    cityDepart = extractRandom(OPTION_VALUE_RE, res.body);
    cityArrive = extractRandom(OPTION_VALUE_RE, res.body);

    res = http.post(
      `${BASE_URL}/cgi-bin/reservations.pl`,
      {
        advanceDiscount: '0',
        depart: cityDepart,
        departDate: '10/25/2026',
        arrive: cityArrive,
        returnDate: '10/30/2026',
        numPassengers: '1',
        seatPref: 'None',
        seatType: 'Coach',
        'findFlights.x': '52',
        'findFlights.y': '8',
        '.cgifields': ['roundtrip', 'seatType', 'seatPref'],
      },
      httpParams({ name: 'ChooseCitiesAndDates' }),
    );
    assertStatus200(res, 'ChooseCitiesAndDates');
    randomFlight = extractRandom(OUTBOUND_FLIGHT_RE, res.body);

    res = http.post(
      `${BASE_URL}/cgi-bin/reservations.pl`,
      {
        outboundFlight: randomFlight,
        numPassengers: '1',
        advanceDiscount: '0',
        seatType: 'Coach',
        seatPref: 'None',
        'reserveFlights.x': '52',
        'reserveFlights.y': '8',
      },
      httpParams({ name: 'ChooseFlight' }),
    );
    assertStatus200(res, 'ChooseFlight');
    firstName = extractInputValue(res.body, 'firstName');
    lastName = extractRandom(
      '<input[^>]*name="lastName"[^>]*value="([^"]*)',
      res.body,
    ) || extractInputValue(res.body, 'lastName');
    address1 = extractInputValue(res.body, 'address1');
    address2 = extractInputValue(res.body, 'address2');
    pass1 = extractRandom(
      '<input[^>]*name="pass1"[^>]*value="([^"]*)',
      res.body,
    ) || extractInputValue(res.body, 'pass1');
    creditCard = extractInputValue(res.body, 'creditCard');
    expDate = extractRandom(
      '<input[^>]*name="expDate"[^>]*value="([^"]*)',
      res.body,
    ) || extractInputValue(res.body, 'expDate');
  });

  let res = http.post(
    `${BASE_URL}/cgi-bin/reservations.pl`,
    {
      firstName,
      lastName,
      address1,
      address2,
      pass1,
      creditCard,
      expDate,
      saveCC: 'on',
      oldCCOption: 'on',
      numPassengers: '1',
      seatType: 'Coach',
      seatPref: 'None',
      outboundFlight: randomFlight,
      advanceDiscount: '0',
      returnFlight: '',
      JSFormSubmit: 'off',
      'buyFlights.x': '51',
      'buyFlights.y': '3',
      '.cgifields': 'saveCC',
    },
    httpParams({ name: 'ByTickets' }),
  );
  assertStatus200(res, 'ByTickets');

  res = http.get(
    `${BASE_URL}/cgi-bin/welcome.pl?signOff=1`,
    httpParams({ name: 'singOff' }),
  );
  assertStatus200(res, 'singOff');

  res = http.get(
    `${BASE_URL}/cgi-bin/nav.pl?in=home`,
    httpParams({ name: 'homePage' }),
  );
  assertStatus200(res, 'homePage');
}
