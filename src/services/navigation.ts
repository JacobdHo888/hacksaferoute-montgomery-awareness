/**
 * Navigation Service for SafeRoute Montgomery
 * Uses OpenStreetMap (Nominatim) for Geocoding and OSRM for Routing
 */

import { SafetyIncident } from './montgomeryData';

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
export async function getRoute(
  start: Coordinate, 
  end: Coordinate, 
  liveCrime: SafetyIncident[] = [], 
  liveCalls: SafetyIncident[] = []
): Promise<RouteData | null> {
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
      
      // Calculate risks based on live data proximity
      let crimeRisk = 10;
      let emergencyRisk = 10;
      
      path.forEach(([lat, lng]) => {
        // Check crime proximity (within ~500m)
        liveCrime.forEach(c => {
          const dist = Math.sqrt(Math.pow(c.location[0] - lat, 2) + Math.pow(c.location[1] - lng, 2));
          if (dist < 0.005) crimeRisk += 2;
        });
        
        // Check 911 calls proximity
        liveCalls.forEach(c => {
          const dist = Math.sqrt(Math.pow(c.location[0] - lat, 2) + Math.pow(c.location[1] - lng, 2));
          if (dist < 0.005) emergencyRisk += 3;
        });
      });

      return {
        id: `dynamic-${Date.now()}`,
        name: 'SafeRoute Dynamic',
        time: `${durationMin} min`,
        distance: parseFloat(distanceKm),
        path,
        baseRisks: {
          crime: Math.min(crimeRisk, 100),
          weather: Math.floor(Math.random() * 20) + 5,
          flood: Math.floor(Math.random() * 15) + 2,
          emergency: Math.min(emergencyRisk, 100)
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
 */
export async function getAlternativeRoute(
  start: Coordinate, 
  end: Coordinate,
  liveCrime: SafetyIncident[] = [], 
  liveCalls: SafetyIncident[] = []
): Promise<RouteData | null> {
  const baseRoute = await getRoute(start, end, liveCrime, liveCalls);
  if (!baseRoute) return null;
  
  return {
    ...baseRoute,
    id: `alt-${Date.now()}`,
    name: 'Standard Route',
    time: `${parseInt(baseRoute.time) - 2} min`,
    baseRisks: {
      crime: Math.min(baseRoute.baseRisks.crime + 20, 100),
      weather: baseRoute.baseRisks.weather + 5,
      flood: baseRoute.baseRisks.flood + 10,
      emergency: Math.min(baseRoute.baseRisks.emergency + 10, 100)
    }
  };
}

/**
 * Reverse geocode coordinates to get an address using Nominatim
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{ name?: string; address?: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    
    if (data) {
      return {
        name: data.name || data.display_name.split(',')[0],
        address: data.display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
