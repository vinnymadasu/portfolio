// Destination markets. Excluded by request: UAE, Saudi Arabia, Qatar, Kuwait,
// Bahrain, Oman, Malaysia, Indonesia, Turkey, Egypt, Pakistan, Bangladesh.
export const ORIGIN = {
  city: 'Hyderabad',
  country: 'IN',
  lat: 17.385,
  lon: 78.4867,
  tz: 'Asia/Kolkata',
  // Hours Vineeth is available to work, in his local time.
  open: 9,
  close: 22,
};

export const MARKETS = [
  { id: 'us', name: 'United States',  city: 'New York',   lang: 'en', tz: 'America/New_York',  lat: 40.7128,  lon: -74.006 },
  { id: 'uk', name: 'United Kingdom', city: 'London',     lang: 'en', tz: 'Europe/London',     lat: 51.5074,  lon: -0.1278 },
  { id: 'ca', name: 'Canada',         city: 'Toronto',    lang: 'en', tz: 'America/Toronto',   lat: 43.6532,  lon: -79.3832 },
  { id: 'de', name: 'Deutschland',    city: 'Berlin',     lang: 'de', tz: 'Europe/Berlin',     lat: 52.52,    lon: 13.405 },
  { id: 'fr', name: 'France',         city: 'Paris',      lang: 'fr', tz: 'Europe/Paris',      lat: 48.8566,  lon: 2.3522 },
  { id: 'es', name: 'España',         city: 'Madrid',     lang: 'es', tz: 'Europe/Madrid',     lat: 40.4168,  lon: -3.7038 },
  { id: 'nl', name: 'Nederland',      city: 'Amsterdam',  lang: 'en', tz: 'Europe/Amsterdam',  lat: 52.3676,  lon: 4.9041 },
  { id: 'br', name: 'Brasil',         city: 'São Paulo',  lang: 'pt', tz: 'America/Sao_Paulo', lat: -23.5505, lon: -46.6333 },
  { id: 'jp', name: '日本',            city: 'Tokyo',      lang: 'ja', tz: 'Asia/Tokyo',        lat: 35.6762,  lon: 139.6503 },
  { id: 'sg', name: 'Singapore',      city: 'Singapore',  lang: 'en', tz: 'Asia/Singapore',    lat: 1.3521,   lon: 103.8198 },
  { id: 'au', name: 'Australia',      city: 'Sydney',     lang: 'en', tz: 'Australia/Sydney',  lat: -33.8688, lon: 151.2093 },
  { id: 'in', name: 'भारत',            city: 'Hyderabad',  lang: 'hi', tz: 'Asia/Kolkata',      lat: 17.385,   lon: 78.4867 },
];

export const WORK_DAY = { open: 9, close: 18 }; // assumed working day in the destination

export function marketById(id) {
  return MARKETS.find((m) => m.id === id) || MARKETS[0];
}
