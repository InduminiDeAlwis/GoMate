// Transport API helper: try to fetch from TransportAPI (requires keys), but fall back to mock data.
export async function fetchTransportItems() {
  // If you have TransportAPI credentials, you can build a real request here.
  // For now, return mock transport items wrapped in { products: [...] } to match existing slice expectations.

  // Attempt remote call to a demo endpoint (kept generic); if it fails, fall back to mock.
  try {
    // Example placeholder - most Transport API calls require keys so this will likely fail in dev.
    const url = 'https://api.transportapi.com/v3/uk/places.json?query=bus&app_id=YOUR_ID&app_key=YOUR_KEY';
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      // Map remote structure to our product-like structure
      const products = (json.member || json.places || []).slice(0, 20).map((p, idx) => ({
        id: p.id || idx + 1000,
        title: p.name || p.atcocode || `Transport ${idx + 1}`,
        description: p.description || p.locality || 'Transport service',
        thumbnail: p.icon || `https://picsum.photos/200/200?random=${idx + 10}`,
        status: 'Active',
        type: p.type || 'Transport',
      }));
      return {products};
    }
  } catch (e) {
    // ignore and fall back
  }

  // Mock transport-themed data
  const mock = [
    {id: 101, title: 'City Express Bus', description: 'Frequent city route connecting downtown and uptown', thumbnail: 'https://picsum.photos/300/200?random=11', status: 'Active', type: 'Bus'},
    {id: 102, title: 'Coastal Ferry', description: 'Scenic ferry service to the nearby islands', thumbnail: 'https://picsum.photos/300/200?random=12', status: 'Popular', type: 'Ferry'},
    {id: 103, title: 'Regional Train', description: 'Comfortable train with Wi-Fi and refreshments', thumbnail: 'https://picsum.photos/300/200?random=13', status: 'Active', type: 'Train'},
    {id: 104, title: 'Airport Shuttle', description: 'Direct shuttle to the airport (every 30 mins)', thumbnail: 'https://picsum.photos/300/200?random=14', status: 'Upcoming', type: 'Shuttle'},
    {id: 105, title: 'Night Rider Bus', description: 'Night-time service across major hubs', thumbnail: 'https://picsum.photos/300/200?random=15', status: 'Popular', type: 'Bus'},
    {id: 106, title: 'River Taxi', description: 'Fast water taxi for riverside stops', thumbnail: 'https://picsum.photos/300/200?random=16', status: 'Active', type: 'Boat'},
  ];

  return {products: mock};
}

export async function fetchTransportItemDetails(id) {
  // Try remote TransportAPI details if available (placeholder), otherwise return mocked details
  try {
    // Placeholder URL - requires app_id/app_key
    const url = `https://api.transportapi.com/v3/uk/places/${id}.json?app_id=YOUR_ID&app_key=YOUR_KEY`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      // Map to our expected detail shape
      return {
        id: json.id || id,
        title: json.name || json.locality || `Transport ${id}`,
        description: json.description || json.locality || 'Transport service details',
        thumbnail: json.icon || `https://picsum.photos/600/300?random=${id}`,
        status: 'Active',
        type: json.type || 'Transport',
        schedule: [],
      };
    }
  } catch (e) {
    // ignore
  }

  // Mock detail payload
  const details = {
    id,
    title: `Detailed ${id}`,
    description: 'This is a detailed description of the transport service, including amenities and notes.',
    thumbnail: `https://picsum.photos/600/300?random=${id}`,
    status: id % 2 === 0 ? 'Active' : 'Popular',
    type: id % 3 === 0 ? 'Train' : id % 3 === 1 ? 'Bus' : 'Ferry',
    schedule: [
      {time: '08:00', dest: 'Central Station'},
      {time: '09:30', dest: 'Airport'},
      {time: '11:00', dest: 'Harbour'},
    ],
    // include geo coordinates for map rendering (mocked around a central point)
    stops: [
      {name: 'Central Station', latitude: 51.5074, longitude: -0.1278},
      {name: 'City Square', latitude: 51.5090, longitude: -0.1180},
      {name: 'Harbour', latitude: 51.5010, longitude: -0.1420},
    ],
  };

  return details;
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


