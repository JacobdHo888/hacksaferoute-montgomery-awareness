import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  center: [number, number];
  routes: any[];
  selectedRouteIndex: number;
  layers: {
    crime: boolean;
    calls: boolean;
    weather: boolean;
    flood: boolean;
    resources: boolean;
  };
  alerts?: any[];
  crimePoints?: any[];
  emergencyResources?: any[];
  floodZones?: any[];
  focusedLocation?: [number, number] | null;
  onMapClick?: (latlng: [number, number]) => void;
}

function MapEvents({ onMapClick }: { onMapClick?: (latlng: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

function ChangeView({ center, focusedLocation }: { center: [number, number], focusedLocation?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (focusedLocation) {
      map.flyTo(focusedLocation, 16, {
        duration: 1.5
      });
    } else {
      map.setView(center, map.getZoom());
    }
  }, [focusedLocation, center, map]);
  return null;
}

export default function MapView({ 
  center, 
  routes, 
  selectedRouteIndex, 
  layers, 
  alerts = [], 
  crimePoints = [],
  emergencyResources = [],
  floodZones = [],
  focusedLocation, 
  onMapClick 
}: MapViewProps) {
  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="z-0"
      >
        <MapEvents onMapClick={onMapClick} />
        <ChangeView center={center} focusedLocation={focusedLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Routes */}
        {routes.map((route, idx) => (
          <Polyline
            key={idx}
            positions={route.path}
            color={idx === selectedRouteIndex ? '#003366' : '#94a3b8'}
            weight={idx === selectedRouteIndex ? 6 : 4}
            opacity={idx === selectedRouteIndex ? 1 : 0.5}
          />
        ))}

        {/* Crime Layer */}
        {layers.crime && crimePoints.map((p, i) => (
          <Marker key={`crime-${i}`} position={p.location as [number, number]} icon={L.divIcon({
            className: 'bg-red-500/20 border-2 border-red-500 rounded-full w-6 h-6 flex items-center justify-center',
            html: '<div class="w-2 h-2 bg-red-500 rounded-full"></div>'
          })}>
            <Popup>Recent Incident: {p.type}</Popup>
          </Marker>
        ))}

        {/* Flood Zones Layer */}
        {layers.flood && floodZones.map((zone, i) => (
          zone.geometry && zone.geometry.rings && zone.geometry.rings.map((ring: any, j: number) => (
            <Polygon
              key={`flood-${i}-${j}`}
              positions={ring.map((coord: [number, number]) => [coord[1], coord[0]])}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.3,
                color: '#2563eb',
                weight: 1
              }}
            >
              <Popup>Flood Zone: {zone.type}</Popup>
            </Polygon>
          ))
        ))}

        {/* Emergency Resources Layer */}
        {layers.resources && emergencyResources.map((r) => (
          <Marker 
            key={r.id} 
            position={r.location as [number, number]} 
            icon={L.divIcon({
              className: cn(
                'border-2 border-white rounded-lg w-8 h-8 flex items-center justify-center shadow-lg transition-all',
                focusedLocation && focusedLocation[0] === r.location[0] && focusedLocation[1] === r.location[1] 
                  ? 'bg-red-500 scale-125 z-[2000]' 
                  : 'bg-blue-500'
              ),
              html: r.type === 'hospital' 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
                : r.type === 'police'
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
                : r.type === 'fire'
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 4 6.5 2 2 3 5.5 3 5.5s-1 1-4 1c-3 0-4-1-4-1Z"/><path d="M15.8 19.1c-1.1.8-2.7 1.4-4.3 1.4-4.6 0-8.3-3.7-8.3-8.3 0-2.5 1.1-4.7 2.8-6.2"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
            })}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold text-sm">{r.name}</div>
                <div className="text-[10px] text-slate-500 uppercase mt-1">{r.type}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Safety Alerts Layer */}
        {alerts.map((alert) => (
          <Marker 
            key={alert.id} 
            position={alert.location} 
            icon={L.divIcon({
              className: cn(
                'rounded-full w-10 h-10 flex items-center justify-center shadow-xl border-2 border-white animate-bounce',
                alert.type === 'weather' ? 'bg-amber-500' :
                alert.type === '911' ? 'bg-red-600' : 'bg-blue-600'
              ),
              html: `<div class="text-white">${
                alert.type === 'weather' ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>' :
                alert.type === '911' ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' :
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 3.5 3.5L12 20.2l-9.2-9a2.5 2.5 0 1 1 3.5-3.5L12 13.2l5.7-5.5z"/></svg>'
              }</div>`
            })}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold text-sm mb-1">{alert.title}</div>
                <div className="text-xs text-slate-600">{alert.description}</div>
                <div className="text-[10px] text-slate-400 mt-2">{alert.timestamp}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Markers for Start/End of selected route */}
        {routes[selectedRouteIndex] && (
          <>
            <Marker position={routes[selectedRouteIndex].path[0]} />
            <Marker position={routes[selectedRouteIndex].path[routes[selectedRouteIndex].path.length - 1]} />
          </>
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 z-[1000] text-xs">
        <div className="font-bold text-slate-900 mb-2">Map Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-civic-blue" />
            <span>Selected Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
              <div className="w-1 h-1 bg-red-500 rounded-full" />
            </div>
            <span>Crime Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 border border-white flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span>Emergency Resource</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500 border border-white flex items-center justify-center shadow-sm animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <span>Active Safety Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-600" />
            <span>Flood Zone (FEMA)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
