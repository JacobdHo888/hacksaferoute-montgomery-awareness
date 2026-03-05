/**
 * Montgomery Open Data Service
 * Fetches live safety data from the City of Montgomery Open Data Portal (ArcGIS)
 */

const ARCGIS_BASE = 'https://services7.arcgis.com/mOBPyk9Z6D95E6yR/arcgis/rest/services';

export interface SafetyIncident {
  id: string;
  type: string;
  location: [number, number];
  timestamp: string;
  description: string;
}

export interface EmergencyResource {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'shelter' | 'fire';
  pos: [number, number];
}

/**
 * Fetch recent crime incidents
 */
export async function fetchCrimeIncidents(): Promise<SafetyIncident[]> {
  try {
    const url = `${ARCGIS_BASE}/Crime_Incidents/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=50&orderByFields=OFFENSE_DATE DESC`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.features) return [];
    
    return data.features.map((f: any) => ({
      id: f.attributes.OBJECTID.toString(),
      type: f.attributes.OFFENSE_TYPE || 'Incident',
      location: [f.geometry.y, f.geometry.x],
      timestamp: new Date(f.attributes.OFFENSE_DATE).toLocaleString(),
      description: f.attributes.BLOCK_ADDRESS || 'No address provided'
    }));
  } catch (error) {
    console.error('Error fetching crime incidents:', error);
    return [];
  }
}

/**
 * Fetch recent 911 calls for service
 */
export async function fetch911Calls(): Promise<SafetyIncident[]> {
  try {
    const url = `${ARCGIS_BASE}/Calls_for_Service/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=30&orderByFields=CALL_DATE_TIME DESC`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.features) return [];
    
    return data.features.map((f: any) => ({
      id: f.attributes.OBJECTID.toString(),
      type: f.attributes.CALL_TYPE || '911 Call',
      location: [f.geometry.y, f.geometry.x],
      timestamp: new Date(f.attributes.CALL_DATE_TIME).toLocaleString(),
      description: f.attributes.LOCATION || 'Active Emergency'
    }));
  } catch (error) {
    console.error('Error fetching 911 calls:', error);
    return [];
  }
}

/**
 * Fetch emergency resources (Hospitals, Fire Stations)
 */
export async function fetchEmergencyResources(): Promise<EmergencyResource[]> {
  try {
    // Fetch Hospitals
    const hospUrl = `${ARCGIS_BASE}/Hospitals/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json`;
    const fireUrl = `${ARCGIS_BASE}/Fire_Stations/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json`;
    
    const [hospRes, fireRes] = await Promise.all([
      fetch(hospUrl).then(r => r.json()),
      fetch(fireUrl).then(r => r.json())
    ]);
    
    const resources: EmergencyResource[] = [];
    
    if (hospRes.features) {
      hospRes.features.forEach((f: any) => {
        resources.push({
          id: `hosp-${f.attributes.OBJECTID}`,
          name: f.attributes.NAME || 'Hospital',
          type: 'hospital',
          pos: [f.geometry.y, f.geometry.x]
        });
      });
    }
    
    if (fireRes.features) {
      fireRes.features.forEach((f: any) => {
        resources.push({
          id: `fire-${f.attributes.OBJECTID}`,
          name: f.attributes.STATION_NAME || 'Fire Station',
          type: 'fire',
          pos: [f.geometry.y, f.geometry.x]
        });
      });
    }
    
    return resources;
  } catch (error) {
    console.error('Error fetching emergency resources:', error);
    return [];
  }
}

/**
 * Fetch flood zones (FEMA)
 */
export async function fetchFloodZones(): Promise<any[]> {
  try {
    const url = `${ARCGIS_BASE}/Flood_Zones/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=100`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.features) return [];
    
    return data.features.map((f: any) => ({
      id: f.attributes.OBJECTID.toString(),
      type: f.attributes.FLD_ZONE || 'Flood Zone',
      geometry: f.geometry
    }));
  } catch (error) {
    console.error('Error fetching flood zones:', error);
    return [];
  }
}
