import Constants from 'expo-constants';

// Read credentials from Expo `extra` (app.json/app.config.js) or process.env as a fallback
const extra = (Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra) || {};
const APP_ID = extra.TRANSPORT_APP_ID || extra.app_id || process.env.TRANSPORT_APP_ID;
const APP_KEY = extra.TRANSPORT_APP_KEY || extra.app_key || process.env.TRANSPORT_APP_KEY;

// Quota tracking (reset daily)
let quotaExceeded = false;
let lastQuotaCheck = null;

// Reset quota flag after 24 hours
function checkQuotaReset() {
  if (lastQuotaCheck) {
    const hoursSinceCheck = (Date.now() - lastQuotaCheck) / (1000 * 60 * 60);
    if (hoursSinceCheck >= 24) {
      quotaExceeded = false;
      lastQuotaCheck = null;
      console.log('✅ API quota reset (24 hours passed)');
    }
  }
}

// Mock data for when quota is exceeded or API is unavailable
function getMockTransportData() {
  return {
    products: [
      {
        id: 'mock_1',
        title: 'Central Bus Station',
        description: 'Main bus terminal - Multiple routes available',
        thumbnail: 'https://picsum.photos/200/200?random=1',
        status: 'Active',
        type: 'Bus Stop',
        latitude: 51.5074,
        longitude: -0.1278,
        atcocode: 'MOCK001',
        schedule: [
          {time: '09:15', dest: 'City Centre', operator: 'Local Bus Co.', platform: null, status: 'On Time'},
          {time: '09:45', dest: 'Shopping Mall', operator: 'Local Bus Co.', platform: null, status: 'On Time'},
          {time: '10:20', dest: 'University Campus', operator: 'Express Lines', platform: null, status: 'On Time'},
          {time: '10:55', dest: 'City Centre', operator: 'Local Bus Co.', platform: null, status: 'Delayed', expected_departure_time: '11:05'},
          {time: '11:30', dest: 'Airport Terminal', operator: 'Airport Express', platform: null, status: 'On Time'},
        ],
        raw: {name: 'Central Bus Station', type: 'bus_stop', atcocode: 'MOCK001'},
      },
      {
        id: 'mock_2',
        title: 'City Centre Train Station',
        description: 'Major railway hub with connections nationwide',
        thumbnail: 'https://picsum.photos/200/200?random=2',
        status: 'Active',
        type: 'Train Station',
        latitude: 51.5033,
        longitude: -0.1195,
        atcocode: 'MOCK002',
        schedule: [
          {time: '09:25', dest: 'London Waterloo', operator: 'National Rail', platform: '3', status: 'On Time'},
          {time: '09:58', dest: 'Brighton', operator: 'Southern Rail', platform: '5', status: 'On Time'},
          {time: '10:12', dest: 'Manchester Piccadilly', operator: 'Virgin Trains', platform: '7', status: 'On Time'},
          {time: '10:45', dest: 'Edinburgh', operator: 'LNER', platform: '2', status: 'Delayed', expected_departure_time: '11:00'},
          {time: '11:20', dest: 'Birmingham New Street', operator: 'CrossCountry', platform: '4', status: 'Cancelled'},
        ],
        raw: {name: 'City Centre Train Station', type: 'train_station', station_code: 'CCT', atcocode: 'MOCK002'},
      },
      {
        id: 'mock_3',
        title: 'Airport Express Stop',
        description: 'Direct service to international airport',
        thumbnail: 'https://picsum.photos/200/200?random=3',
        status: 'Popular',
        type: 'Bus Stop',
        latitude: 51.5155,
        longitude: -0.0922,
        atcocode: 'MOCK003',
        schedule: [
          {time: '09:00', dest: 'International Airport', operator: 'Airport Express', platform: null, status: 'On Time'},
          {time: '09:30', dest: 'International Airport', operator: 'Airport Express', platform: null, status: 'On Time'},
          {time: '10:00', dest: 'International Airport', operator: 'Airport Express', platform: null, status: 'On Time'},
          {time: '10:30', dest: 'International Airport', operator: 'Airport Express', platform: null, status: 'On Time'},
          {time: '11:00', dest: 'International Airport', operator: 'Airport Express', platform: null, status: 'On Time'},
        ],
        raw: {name: 'Airport Express Stop', type: 'bus_stop', atcocode: 'MOCK003'},
      },
    ],
  };
}

// Transport API helper: try to fetch from TransportAPI (requires keys), but fall back to mock data.
export async function fetchTransportItems() {
  // Check if quota should be reset
  checkQuotaReset();

  // If quota exceeded, return mock data immediately
  if (quotaExceeded) {
    console.warn('⚠️ API quota exceeded - Using mock data (resets in 24h)');
    return getMockTransportData();
  }

  // If you have TransportAPI credentials, attempt a real request. Otherwise, return mock data.
  if (APP_ID && APP_KEY) {
    try {
      const url = `https://transportapi.com/v3/uk/places.json?query=bus&app_id=${APP_ID}&app_key=${APP_KEY}`;
      console.log('🔄 Fetching from TransportAPI...');
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'No error details');
        console.warn('TransportAPI list request failed:', res.status, res.statusText);
        
        // If 403, check if it's a quota/auth issue
        if (res.status === 403) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error && errorJson.error.includes('usage limits are exceeded')) {
              quotaExceeded = true;
              lastQuotaCheck = Date.now();
              console.error('❌ Daily quota exceeded (30 hits/day)');
              console.error('📅 Quota resets in 24 hours');
              console.error('💡 Using mock data until reset');
              return getMockTransportData();
            }
          } catch (e) {
            // Error parsing JSON, continue with generic handling
          }
          console.error('⚠️ 403 Forbidden - Possible reasons:');
          console.error('1. API key/ID incorrect or expired');
          console.error('2. Daily quota exceeded (Free plan: 30 hits/day)');
          console.error('3. API endpoint not included in your plan');
        }
        // Return mock data for any error
        return getMockTransportData();
      } else {
        const json = await res.json();
        console.log('✅ Successfully fetched from TransportAPI');

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

        // Return whatever the API returned (could be empty)
        return {products};
      }
    } catch (e) {
      // remote call failed; fall back to mock data
      console.warn('❌ TransportAPI fetch failed:', e.message || e);
      console.warn('💡 Using mock data');
      return getMockTransportData();
    }
  } else {
    console.warn('⚠️ TransportAPI credentials missing: APP_ID/APP_KEY not found in Expo extras or environment');
  }

  // Fallback to mock data
  return getMockTransportData();
}

export async function fetchTransportItemDetails(id) {
  // Check if this is a mock ID - return mock detail immediately
  if (id && id.toString().startsWith('mock_')) {
    const mockData = getMockTransportData();
    const mockItem = mockData.products.find(p => p.id === id);
    if (mockItem) {
      console.log('📦 Returning mock detail for:', id);
      return {
        ...mockItem,
        stops: mockItem.latitude && mockItem.longitude ? [
          {name: mockItem.title, latitude: mockItem.latitude, longitude: mockItem.longitude}
        ] : [],
      };
    }
  }

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

// Attempt to fetch timetable/schedule info for a place using common TransportAPI endpoints.
export async function fetchTimetableForPlace(raw) {
  if (!raw) return [];
  const idCandidates = [];
  if (raw.atcocode) idCandidates.push({type: 'atcocode', value: raw.atcocode});
  if (raw.station_code) idCandidates.push({type: 'station_code', value: raw.station_code});
  if (raw.tiploc_code) idCandidates.push({type: 'tiploc_code', value: raw.tiploc_code});
  if (raw.smscode) idCandidates.push({type: 'smscode', value: raw.smscode});
  if (raw.osm_id) idCandidates.push({type: 'osm_id', value: raw.osm_id});
  if (raw.name) idCandidates.push({type: 'name', value: raw.name});

  const attempts = [];

  // FREE PLAN ENDPOINTS ONLY (30 hits/day limit)
  // Bus stop timetables (singular) - ✅ Included in free plan
  idCandidates.forEach((c) => {
    if (c.type === 'atcocode' || c.type === 'smscode') {
      attempts.push({url: `https://transportapi.com/v3/uk/bus/stop/${encodeURIComponent(c.value)}/live.json?app_id=${APP_ID}&app_key=${APP_KEY}&group=route&nextbuses=yes`, reason: 'bus stop live'});
    }
  });

  // Train station timetables (singular) - ✅ Included in free plan (non-live version)
  idCandidates.forEach((c) => {
    if (c.type === 'station_code' || c.type === 'tiploc_code') {
      // Use standard timetables endpoint (not /live.json which requires premium)
      attempts.push({url: `https://transportapi.com/v3/uk/train/station/${encodeURIComponent(c.value)}/timetable.json?app_id=${APP_ID}&app_key=${APP_KEY}`, reason: 'train station timetables'});
    }
  });

  // If no attempts were generated, try a name query on places (as a last resort)
  if (attempts.length === 0 && raw.name) {
    attempts.push({url: `https://transportapi.com/v3/uk/places.json?query=${encodeURIComponent(raw.name)}&app_id=${APP_ID}&app_key=${APP_KEY}`, reason: 'places by name fallback'});
  }

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url);
      if (!res.ok) {
        console.warn('Timetable attempt failed:', attempt.reason, res.status, res.statusText, attempt.url);
        continue;
      }
      const json = await res.json();

      // Try to extract schedules in common locations
      // TransportAPI returns different structures: departures (train), timetables (bus), services, etc.
      const candidateSchedules = json.departures?.all || json.departures || json.timetables || json.services || json.data || json.schedule || json.schedules || json.member || [];
      let schedules = [];
      if (Array.isArray(candidateSchedules) && candidateSchedules.length > 0) {
        // Map a few common shapes into {time, dest, operator}
        schedules = candidateSchedules.slice(0, 50).map((s) => {
          // s might be a service object or a simple timetable entry
          const time = s.aimed_departure_time || s.expected_departure_time || s.time || s.best_departure_estimate || s.departure_time || s.estimated_departure || (s.departures && s.departures[0] && (s.departures[0].aimed_departure_time || s.departures[0].expected_departure_time)) || null;
          const dest = s.destination_name || s.destination || s.to || s.route || (s.departures && s.departures[0] && s.departures[0].destination_name) || null;
          const operator = s.operator_name || s.operator || s.service_operator || null;
          const platform = s.platform || null;
          const status = s.status || null;
          return {time, dest, operator, platform, status, expected_departure_time: s.expected_departure_time, raw: s};
        }).filter((x) => x.time || x.dest);
      } else if (Array.isArray(json.member) && json.member.length > 0) {
        schedules = json.member.slice(0, 50).map((m) => ({time: m.time || null, dest: m.name || m.title || null, raw: m})).filter((x) => x.time || x.dest);
      }

      if (schedules.length > 0) return schedules;
    } catch (e) {
      console.warn('Timetable fetch error for attempt', attempt.reason, e.message || e);
      continue;
    }
  }

  return [];
}


