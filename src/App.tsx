import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  return (
    <div className="h-full">
      {view === 'landing' ? (
        <LandingPage onStart={() => setView('app')} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
