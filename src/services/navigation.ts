/**
 * Navigation Service for SafeRoute Montgomery
 * Uses OpenStreetMap (Nominatim) for Geocoding and OSRM for Routing
 */

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface RouteData {
  id: string;
  name: string;
  time: string;
  distance: number;
  path: [number, number][];
  baseRisks: {
    crime: number;
    weather: number;
    flood: number;
    emergency: number;
  };
}

/**
 * Geocode an address string to coordinates using Nominatim
 * Restricted to Montgomery, AL area for hackathon focus
 */
export async function geocode(address: string): Promise<Coordinate | null> {
  try {
    // Append Montgomery, AL to improve accuracy if not present
    const query = address.toLowerCase().includes('montgomery') 
      ? address 
      : `${address}, Montgomery, AL`;
      
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Get routing data between two points using OSRM
 */
export async function getRoute(start: Coordinate, end: Coordinate): Promise<RouteData | null> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0];
      const durationMin = Math.round(route.duration / 60);
      const distanceKm = (route.distance / 1000).toFixed(1);
      
      // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
      const path: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      
      // Vibe-coded safety risk generation
      // In a real app, this would query a safety database along the path
      // For the hackathon, we generate plausible risks based on the route properties
      const seed = Math.random();
      return {
        id: `dynamic-${Date.now()}`,
        name: 'SafeRoute Dynamic',
        time: `${durationMin} min`,
        distance: parseFloat(distanceKm),
        path,
        baseRisks: {
          crime: Math.floor(seed * 40) + 10,
          weather: Math.floor(Math.random() * 20) + 5,
          flood: Math.floor(Math.random() * 15) + 2,
          emergency: Math.floor(Math.random() * 50) + 40
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

/**
 * Generate an alternative "Standard" route for comparison
 * (Simulated by adding a slight detour or using a different OSRM profile if available)
 */
export async function getAlternativeRoute(start: Coordinate, end: Coordinate): Promise<RouteData | null> {
  // For simplicity, we'll just fetch the same route but give it different "vibe" risks
  // and maybe a slightly longer time to simulate a "standard" vs "safe" comparison
  const baseRoute = await getRoute(start, end);
  if (!baseRoute) return null;
  
  return {
    ...baseRoute,
    id: `alt-${Date.now()}`,
    name: 'Standard Route',
    time: `${parseInt(baseRoute.time) - 2} min`, // Standard is often faster but less safe
    baseRisks: {
      crime: baseRoute.baseRisks.crime + 25,
      weather: baseRoute.baseRisks.weather + 5,
      flood: baseRoute.baseRisks.flood + 10,
      emergency: baseRoute.baseRisks.emergency - 20
    }
  };
}
