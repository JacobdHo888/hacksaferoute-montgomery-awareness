import React from 'react';
import { motion } from 'motion/react';
import { X, Shield, AlertTriangle, Clock, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface NeighborhoodSnapshotProps {
  location: [number, number];
  onClose: () => void;
}

const RISK_BY_TIME = [
  { time: '6am', risk: 10 },
  { time: '10am', risk: 15 },
  { time: '2pm', risk: 25 },
  { time: '6pm', risk: 45 },
  { time: '10pm', risk: 75 },
  { time: '2am', risk: 85 },
];

export default function NeighborhoodSnapshot({ location, onClose }: NeighborhoodSnapshotProps) {
  // Mock data based on location
  const score = Math.floor(Math.random() * 40) + 50; // 50-90
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-24 right-6 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 z-[1000] overflow-hidden"
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-civic-blue" />
          <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Neighborhood Snapshot</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Score Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Safety Score</div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-3xl font-bold",
                score > 80 ? "text-safety-green" : score > 65 ? "text-safety-yellow" : "text-safety-red"
              )}>{score}</span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</div>
            <div className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
              score > 80 ? "bg-green-100 text-green-700" : score > 65 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
            )}>
              {score > 80 ? 'Secure' : score > 65 ? 'Caution' : 'High Risk'}
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Recent Incidents (24h)
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-700">Vandalism reported</span>
              <span className="text-slate-400 font-mono text-[9px]">2h ago</span>
            </div>
            <div className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-700">911 Medical Call</span>
              <span className="text-slate-400 font-mono text-[9px]">5h ago</span>
            </div>
          </div>
        </div>

        {/* Risk Patterns */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Time-of-Day Risk Pattern
          </div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RISK_BY_TIME}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none' }}
                />
                <Bar 
                  dataKey="risk" 
                  fill="#003366" 
                  radius={[2, 2, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[9px] text-slate-400 italic leading-tight">
            Location: {location[0].toFixed(4)}, {location[1].toFixed(4)}. Data refreshed every 15 minutes.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
