import Constants from 'expo-constants';

// Read credentials from Expo `extra` (app.json/app.config.js) or process.env as a fallback
const extra = (Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra) || {};
const APP_ID = extra.TRANSPORT_APP_ID || extra.app_id || process.env.TRANSPORT_APP_ID;
const APP_KEY = extra.TRANSPORT_APP_KEY || extra.app_key || process.env.TRANSPORT_APP_KEY;

// Transport API helper: try to fetch from TransportAPI (requires keys), but fall back to mock data.
export async function fetchTransportItems() {
  // If you have TransportAPI credentials, attempt a real request. Otherwise, return mock data.
  if (APP_ID && APP_KEY) {
    try {
      const url = `https://transportapi.com/v3/uk/places.json?query=bus&app_id=${APP_ID}&app_key=${APP_KEY}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('TransportAPI list request failed:', res.status, res.statusText);
      } else {
        const json = await res.json();

        // Try multiple possible array fields that TransportAPI or other endpoints might return
        const candidates = json.member || json.places || json.stops || json.features || json.results || json.data || json.entries || [];
        const products = (Array.isArray(candidates) ? candidates.slice(0, 50) : []).map((p, idx) => ({
          id: p.id || p.atcocode || p.atco || p.stop_id || p.properties?.id || idx + 1000,
          atcocode: p.atcocode || p.atco || null,
          title: p.name || p.properties?.name || p.locality || p.title || `Transport ${idx + 1}`,
          description: p.description || p.properties?.description || p.locality || p.address || 'Transport service',
          thumbnail: p.icon || p.properties?.icon || `https://picsum.photos/200/200?random=${idx + 10}`,
          status: 'Active',
          type: p.type || p.properties?.type || 'Transport',
          latitude: p.latitude || p.properties?.latitude || null,
          longitude: p.longitude || p.properties?.longitude || null,
          raw: p,
        }));

        // Return whatever the API returned (could be empty). Do not fall back to mock when credentials are present.
        return {products};
      }
    } catch (e) {
      // remote call failed; fall back to mock data below
      console.warn('TransportAPI fetch failed, falling back to mock data:', e.message || e);
    }
  } else {
    console.warn('TransportAPI credentials missing: APP_ID/APP_KEY not found in Expo extras or environment');
  }

  // No mock fallback: when credentials are missing or remote fails return an empty products list.
  return {products: []};
}

export async function fetchTransportItemDetails(id) {
  // Try several strategies to fetch a place detail. TransportAPI list entries may need query params
  // such as atcocode, osm_id, station_code or tiploc_code rather than a path id.
  const attempts = [];
  // 1) Try common query parameters first (atcocode, osm_id, station_code, tiploc_code)
  attempts.push({ url: `https://transportapi.com/v3/uk/places.json?atcocode=${encodeURIComponent(id)}&app_id=${APP_ID}&app_key=${APP_KEY}`, reason: 'atcocode param' });
  attempts.push({ url: `https://transportapi.com/v3/uk/places.json?osm_id=${encodeURIComponent(id)}&app_id=${APP_ID}&app_key=${APP_KEY}`, reason: 'osm_id param' });
  attempts.push({ url: `https://transportapi.com/v3/uk/places.json?station_code=${encodeURIComponent(id)}&app_id=${APP_ID}&app_key=${APP_KEY}`, reason: 'station_code param' });
  attempts.push({ url: `https://transportapi.com/v3/uk/places.json?tiploc_code=${encodeURIComponent(id)}&app_id=${APP_ID}&app_key=${APP_KEY}`, reason: 'tiploc_code param' });

  // 2) Try path-based id last (some place identifiers are path-safe)
  attempts.push({
    url: APP_ID && APP_KEY
      ? `https://transportapi.com/v3/uk/places/${encodeURIComponent(id)}.json?app_id=${APP_ID}&app_key=${APP_KEY}`
      : `https://transportapi.com/v3/uk/places/${encodeURIComponent(id)}.json`,
    reason: 'path id',
  });

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url);
      if (!res.ok) {
        console.warn('TransportAPI detail attempt failed:', attempt.reason, res.status, res.statusText, attempt.url);
        continue;
      }
      const json = await res.json();
      // If this is a list response, use first member
      const source = Array.isArray(json.member) && json.member.length > 0 ? json.member[0] : json;

      return {
        id: source.id || source.atcocode || source.properties?.id || id,
        title: source.name || source.properties?.name || source.locality || `Transport ${id}`,
        description: source.description || source.properties?.description || source.locality || 'Transport service details',
        thumbnail: source.icon || source.properties?.icon || `https://picsum.photos/600/300?random=${id}`,
        status: 'Active',
        type: source.type || source.properties?.type || 'Transport',
        schedule: source.schedule || source.timetable || [],
        stops: source.stops || source.features || source.points || [],
        latitude: source.latitude || source.properties?.latitude || null,
        longitude: source.longitude || source.properties?.longitude || null,
        raw: source,
      };
    } catch (e) {
      console.warn('TransportAPI detail fetch error for attempt', attempt.reason, e.message || e);
      continue;
    }
  }

  // Nothing found
  return null;
}

export async function bookTransportItem(itemId, opts = {}) {
  // Mock a booking creation. In a real app you'd call the provider's booking endpoint.
  // opts can include user info, seats, payment token, etc.
  await new Promise((r) => setTimeout(r, 600));
  const booking = {
    id: `bk_${Date.now()}`,
    itemId,
    user: opts.user || {username: 'guest'},
    bookedAt: new Date().toISOString(),
    confirmationCode: Math.random().toString(36).slice(2, 9).toUpperCase(),
    status: 'confirmed',
  };
  return booking;
}


