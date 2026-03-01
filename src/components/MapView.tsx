import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function MapView({ center, routes, selectedRouteIndex, layers }: MapViewProps) {
  // Mock data for layers
  const [crimePoints] = useState([
    { pos: [32.3668, -86.3000], type: 'Theft' },
    { pos: [32.3770, -86.3100], type: 'Vandalism' },
    { pos: [32.3500, -86.2800], type: 'Theft' },
  ]);

  const [emergencyResources] = useState([
    { pos: [32.3792, -86.3077], name: 'Baptist Medical Center South' },
    { pos: [32.3615, -86.2995], name: 'Montgomery Police Dept' },
    { pos: [32.3850, -86.2500], name: 'Emergency Shelter A' },
  ]);

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="z-0"
      >
        <ChangeView center={center} />
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
          <Marker key={`crime-${i}`} position={p.pos as [number, number]} icon={L.divIcon({
            className: 'bg-red-500/20 border-2 border-red-500 rounded-full w-6 h-6 flex items-center justify-center',
            html: '<div class="w-2 h-2 bg-red-500 rounded-full"></div>'
          })}>
            <Popup>Recent Incident: {p.type}</Popup>
          </Marker>
        ))}

        {/* Emergency Resources Layer */}
        {layers.resources && emergencyResources.map((r, i) => (
          <Marker key={`res-${i}`} position={r.pos as [number, number]} icon={L.divIcon({
            className: 'bg-blue-500 border-2 border-white rounded-lg w-8 h-8 flex items-center justify-center shadow-lg',
            html: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
          })}>
            <Popup>{r.name}</Popup>
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
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Crime Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-lg bg-blue-500" />
            <span>Emergency Resource</span>
          </div>
        </div>
      </div>
    </div>
  );
}
