import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, MapPin, Navigation, Search, 
  Layers, AlertTriangle, CloudRain, 
  Wind, Activity, Info, ChevronRight,
  Menu, X, Sparkles, Clock, TrendingUp,
  Phone, PlusSquare, Home, Share2
} from 'lucide-react';
import MapView from './MapView';
import { getSafetyExplanation } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import SafetyTrends from './SafetyTrends';
import { geocode, getRoute, getAlternativeRoute, RouteData } from '../services/navigation';

// Mock Data for Routes
const MOCK_ROUTES_BASE = [
  {
    id: 'r1',
    name: 'Standard Route',
    time: '12 min',
    recommended: false,
    risks: ['Moderate 911 Activity', 'Construction'],
    path: [
      [32.3668, -86.3000],
      [32.3700, -86.2950],
      [32.3750, -86.2900],
      [32.3792, -86.3077]
    ],
    baseRisks: {
      crime: 45,
      weather: 20,
      flood: 10,
      emergency: 40
    }
  },
  {
    id: 'r2',
    name: 'SafeRoute Recommended',
    time: '15 min',
    recommended: true,
    risks: ['Low Incident Density'],
    path: [
      [32.3668, -86.3000],
      [32.3600, -86.3100],
      [32.3650, -86.3200],
      [32.3750, -86.3150],
      [32.3792, -86.3077]
    ],
    baseRisks: {
      crime: 10,
      weather: 15,
      flood: 5,
      emergency: 85
    }
  }
];

export type AlertType = 'weather' | '911' | 'flood';

export interface SafetyAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  location: [number, number];
  timestamp: string;
}

const MOCK_ALERTS: SafetyAlert[] = [
  {
    id: 'a1',
    type: 'weather',
    title: 'Flash Flood Warning',
    description: 'Heavy rainfall expected in North Montgomery. Avoid low-lying areas.',
    location: [32.3850, -86.3200],
    timestamp: '10 min ago'
  },
  {
    id: 'a2',
    type: '911',
    title: 'Medical Emergency',
    description: 'Active response near Court St. Expect minor delays.',
    location: [32.3720, -86.2850],
    timestamp: '5 min ago'
  },
  {
    id: 'a3',
    type: 'flood',
    title: 'High Water Alert',
    description: 'Water over roadway reported near Alabama River pkwy.',
    location: [32.3550, -86.3100],
    timestamp: '25 min ago'
  }
];

const EMERGENCY_RESOURCES = [
  { id: 'h1', pos: [32.3792, -86.3077], name: 'Baptist Medical Center South', type: 'hospital' },
  { id: 'h2', pos: [32.3450, -86.2850], name: 'Jackson Hospital', type: 'hospital' },
  { id: 'p1', pos: [32.3615, -86.2995], name: 'Montgomery Police Dept', type: 'police' },
  { id: 's1', pos: [32.3850, -86.2500], name: 'Emergency Shelter A', type: 'shelter' },
  { id: 's2', pos: [32.3550, -86.3200], name: 'Community Center Shelter', type: 'shelter' },
];

export default function Dashboard() {
  const [start, setStart] = useState('100 Dexter Ave, Montgomery, AL');
  const [dest, setDest] = useState('Baptist Medical Center South, Montgomery, AL');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null);
  const [activeTab, setActiveTab] = useState<'insight' | 'trends'>('insight');
  const [dynamicRoutes, setDynamicRoutes] = useState<RouteData[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([32.3668, -86.3000]);
  const [layers, setLayers] = useState({
    crime: true,
    calls: false,
    weather: false,
    flood: false,
    resources: true
  });

  const [weights, setWeights] = useState({
    crime: 40,
    weather: 20,
    flood: 20,
    emergency: 20
  });

  const calculateScore = (baseRisks: any) => {
    const totalWeight = weights.crime + weights.weather + weights.flood + weights.emergency;
    if (totalWeight === 0) return 0;

    const crimeScore = (100 - baseRisks.crime) * (weights.crime / totalWeight);
    const weatherScore = (100 - baseRisks.weather) * (weights.weather / totalWeight);
    const floodScore = (100 - baseRisks.flood) * (weights.flood / totalWeight);
    const emergencyScore = baseRisks.emergency * (weights.emergency / totalWeight);

    return Math.round(crimeScore + weatherScore + floodScore + emergencyScore);
  };

  const routes = dynamicRoutes.length > 0 
    ? dynamicRoutes.map((route, idx) => ({
        ...route,
        recommended: idx === 0, // Assume first is safer for now
        risks: idx === 0 ? ['Low Incident Density'] : ['Moderate 911 Activity', 'Construction'],
        score: calculateScore(route.baseRisks)
      }))
    : MOCK_ROUTES_BASE.map(route => ({
        ...route,
        score: calculateScore(route.baseRisks)
      }));

  const handleSearch = async () => {
    setIsSearching(true);
    setIsLoadingAi(true);
    setFocusedLocation(null);
    
    try {
      let startCoord = userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null;
      if (!startCoord || start !== 'My Location') {
        startCoord = await geocode(start);
      }
      
      const endCoord = await geocode(dest);
      
      if (startCoord && endCoord) {
        const [safe, standard] = await Promise.all([
          getRoute(startCoord, endCoord),
          getAlternativeRoute(startCoord, endCoord)
        ]);
        
        if (safe && standard) {
          setDynamicRoutes([safe, standard]);
          setMapCenter([startCoord.lat, startCoord.lng]);
          setSelectedRouteIdx(0);
        }
      } else {
        alert('Could not find one or more locations. Please try a more specific address in Montgomery.');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setStart('My Location');
        setMapCenter([latitude, longitude]);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location. Please check your browser permissions.');
      }
    );
  };

  const findNearest = (type: string) => {
    // Current user location (mocked as route start)
    const userLoc = routes[selectedRouteIdx].path[0];
    
    const filtered = EMERGENCY_RESOURCES.filter(r => r.type === type);
    if (filtered.length === 0) return;

    // Simple Euclidean distance for mock purposes
    const nearest = filtered.reduce((prev, curr) => {
      const distPrev = Math.sqrt(Math.pow(prev.pos[0] - userLoc[0], 2) + Math.pow(prev.pos[1] - userLoc[1], 2));
      const distCurr = Math.sqrt(Math.pow(curr.pos[0] - userLoc[0], 2) + Math.pow(curr.pos[1] - userLoc[1], 2));
      return distPrev < distCurr ? prev : curr;
    });

    setFocusedLocation(nearest.pos as [number, number]);
    setLayers(prev => ({ ...prev, resources: true }));
  };

  const fetchAiInsight = async () => {
    if (!routes[selectedRouteIdx]) return;
    setIsLoadingAi(true);
    const explanation = await getSafetyExplanation(routes[selectedRouteIdx]);
    setAiExplanation(explanation || "No explanation available.");
    setIsLoadingAi(false);
  };

  useEffect(() => {
    fetchAiInsight();
  }, [selectedRouteIdx, dynamicRoutes]);

  useEffect(() => {
    // Initial search
    handleSearch();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Left Sidebar - Route Inputs */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-6 h-6 text-civic-blue" />
            <span className="font-bold text-lg text-civic-blue">SafeRoute</span>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (e.target.value !== 'My Location') setUserLocation(null);
                }}
                placeholder="Starting Point"
                className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue outline-none transition-all"
              />
              <button 
                onClick={useMyLocation}
                className="absolute right-2 top-2 p-1 text-civic-blue hover:bg-blue-50 rounded-lg transition-colors"
                title="Use My Location"
              >
                <Navigation className="w-4 h-4" />
              </button>
              <div className="absolute left-5 top-10 w-0.5 h-4 bg-slate-200" />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-3 text-civic-blue">
                <Navigation className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="Destination"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full bg-civic-blue text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isSearching ? 'Analyzing...' : 'Find Safer Route'}
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-2 mb-3">Route Options</div>
            <div className="space-y-3">
              {routes.map((route, idx) => (
                <button 
                  key={route.id}
                  onClick={() => setSelectedRouteIdx(idx)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group",
                    selectedRouteIdx === idx 
                      ? "bg-blue-50/50 border-civic-blue shadow-sm" 
                      : "bg-white border-slate-100 hover:border-slate-300"
                  )}
                >
                  {route.recommended && (
                    <div className="absolute top-0 right-0 bg-civic-blue text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">
                      Recommended
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{route.name}</h4>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      route.score > 80 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {route.score}/100
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {route.score > 80 ? 'High Safety' : 'Moderate Safety'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {route.risks.map((risk, i) => (
                      <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {risk}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-2 mb-3 flex items-center justify-between">
              <span>Safety Preferences</span>
              <Sparkles className="w-3 h-3 text-civic-blue" />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-4 shadow-sm">
              {[
                { id: 'crime', label: 'Crime Risk', icon: <AlertTriangle className="w-3 h-3" /> },
                { id: 'weather', label: 'Weather Risk', icon: <CloudRain className="w-3 h-3" /> },
                { id: 'flood', label: 'Flood Risk', icon: <Wind className="w-3 h-3" /> },
                { id: 'emergency', label: 'Emergency Proximity', icon: <Shield className="w-3 h-3" /> },
              ].map((pref) => (
                <div key={pref.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                      {pref.icon}
                      {pref.label}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{weights[pref.id as keyof typeof weights]}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={weights[pref.id as keyof typeof weights]}
                    onChange={(e) => setWeights(prev => ({ ...prev, [pref.id]: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-civic-blue"
                  />
                </div>
              ))}
              <div className="pt-2 text-[9px] text-slate-400 italic leading-tight">
                Adjusting these weights dynamically recalculates route safety scores based on your personal priorities.
              </div>
            </div>
          </section>

          <section>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-2 mb-3 flex items-center justify-between">
              <span>Active Safety Alerts</span>
              <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">Live</span>
            </div>
            <div className="space-y-3">
              {MOCK_ALERTS.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      alert.type === 'weather' ? "bg-amber-50 text-amber-600" :
                      alert.type === '911' ? "bg-red-50 text-red-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {alert.type === 'weather' ? <CloudRain className="w-4 h-4" /> :
                       alert.type === '911' ? <AlertTriangle className="w-4 h-4" /> :
                       <Wind className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-bold text-slate-900">{alert.title}</h5>
                        <span className="text-[9px] text-slate-400">{alert.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{alert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Safety Layer Toggles */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-2 mb-4 flex items-center gap-2">
            <Layers className="w-3 h-3" />
            Map Layers
          </div>
          <div className="grid grid-template-columns-2 gap-2">
            {[
              { id: 'crime', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Crime' },
              { id: 'calls', icon: <Activity className="w-3.5 h-3.5" />, label: '911 Calls' },
              { id: 'weather', icon: <CloudRain className="w-3.5 h-3.5" />, label: 'Weather' },
              { id: 'flood', icon: <Wind className="w-3.5 h-3.5" />, label: 'Flood' },
              { id: 'resources', icon: <Shield className="w-3.5 h-3.5" />, label: 'Resources' },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setLayers(prev => ({ ...prev, [layer.id]: !prev[layer.id as keyof typeof prev] }))}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all border",
                  layers[layer.id as keyof typeof layers]
                    ? "bg-white border-civic-blue text-civic-blue shadow-sm"
                    : "bg-slate-100 border-transparent text-slate-400"
                )}
              >
                {layer.icon}
                {layer.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content - Map */}
      <main className="flex-1 relative">
        <MapView 
          center={mapCenter} 
          routes={routes} 
          selectedRouteIndex={selectedRouteIdx}
          layers={layers}
          alerts={MOCK_ALERTS}
          focusedLocation={focusedLocation}
        />

        {/* Floating Header */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-[1000]">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-safety-green animate-pulse" />
              <span className="text-xs font-bold text-slate-600">Live Safety Feed Active</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-xs text-slate-500">
              Last updated: <span className="font-mono">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Right Panel - AI Explanation */}
      <aside className="w-96 bg-white border-l border-slate-200 flex flex-col z-10 shadow-xl">
        {/* Emergency Quick Actions */}
        <div className="p-6 border-b border-slate-100 bg-red-50/30">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Emergency Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.location.href = 'tel:911'}
              className="flex items-center gap-2 bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-all shadow-sm group"
            >
              <Phone className="w-4 h-4 group-hover:animate-shake" />
              <span className="text-xs font-bold">Call 911</span>
            </button>
            <button 
              className="flex items-center gap-2 bg-civic-blue text-white p-3 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
              onClick={() => findNearest('hospital')}
            >
              <PlusSquare className="w-4 h-4" />
              <span className="text-xs font-bold">Hospital</span>
            </button>
            <button 
              className="flex items-center gap-2 bg-safety-green text-white p-3 rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
              onClick={() => findNearest('shelter')}
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-bold">Shelter</span>
            </button>
            <button 
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert('Location link copied to clipboard!');
              }}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-bold">Share</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-civic-blue">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">AI Safety Insight</h3>
            </div>
            <div className="bg-blue-50 text-civic-blue text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
              Gemini 3 Flash
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Safety Score</div>
            <div className="flex items-end gap-2">
              <span className={cn(
                "text-5xl font-bold",
                routes[selectedRouteIdx].score > 80 ? "text-safety-green" : "text-safety-yellow"
              )}>
                {routes[selectedRouteIdx].score}
              </span>
              <span className="text-slate-400 font-bold mb-1">/ 100</span>
            </div>
            <div className="mt-4 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${routes[selectedRouteIdx].score}%` }}
                className={cn(
                  "h-full rounded-full",
                  routes[selectedRouteIdx].score > 80 ? "bg-safety-green" : "bg-safety-yellow"
                )}
              />
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-2">
            <button 
              onClick={() => setActiveTab('insight')}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2",
                activeTab === 'insight' ? "bg-white text-civic-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Sparkles className="w-3 h-3" />
              AI Insight
            </button>
            <button 
              onClick={() => setActiveTab('trends')}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2",
                activeTab === 'trends' ? "bg-white text-civic-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Activity className="w-3 h-3" />
              City Trends
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'insight' ? (
            isLoadingAi ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
                <div className="h-20 bg-slate-100 rounded w-full" />
              </div>
            ) : (
              <div className="max-w-none">
                <div className="markdown-body">
                  <ReactMarkdown>
                    {aiExplanation || "Select a route to see AI safety insights."}
                  </ReactMarkdown>
                </div>
              </div>
            )
          ) : (
            <SafetyTrends />
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-civic-blue" />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              This analysis is based on public safety data from the Montgomery Open Data portal. AI summaries are for informational purposes only. Always stay aware of your surroundings.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
