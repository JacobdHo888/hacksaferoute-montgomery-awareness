import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

const CRIME_TRENDS_DATA = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 38 },
  { name: 'Thu', value: 65 },
  { name: 'Fri', value: 48 },
  { name: 'Sat', value: 70 },
  { name: 'Sun', value: 55 },
];

const CALL_FREQUENCY_DATA = [
  { name: '00:00', value: 12 },
  { name: '04:00', value: 8 },
  { name: '08:00', value: 25 },
  { name: '12:00', value: 45 },
  { name: '16:00', value: 60 },
  { name: '20:00', value: 35 },
];

const ALERT_PATTERNS_DATA = [
  { name: 'Weather', value: 30 },
  { name: '911', value: 50 },
  { name: 'Flood', value: 20 },
];

export default function SafetyTrends() {
  return (
    <div className="space-y-8 py-4">
      {/* Crime Activity Trends */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Crime Activity (7 Days)</h4>
          <span className="text-[10px] text-green-500 font-bold">-12% vs LW</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CRIME_TRENDS_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '10px' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#003366" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#003366', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 911 Call Frequency */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">911 Call Volume (24h)</h4>
          <span className="text-[10px] text-slate-400 font-mono">Avg: 32/hr</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CALL_FREQUENCY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '10px' }}
              />
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Alert Patterns */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Alert Distribution</h4>
          <span className="text-[10px] text-slate-400">Past 30 Days</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CRIME_TRENDS_DATA}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003366" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '10px' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#003366" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="pt-4 border-t border-slate-100">
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">City Insight</span>
          </div>
          <p className="text-[11px] text-blue-600 leading-relaxed">
            Current trends show a 15% decrease in nighttime incidents in the downtown area. Weather-related alerts are peaking due to seasonal rainfall.
          </p>
        </div>
      </div>
    </div>
  );
}
