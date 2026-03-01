import React from 'react';
import { motion } from 'motion/react';
import { Shield, MapPin, Navigation, AlertTriangle, Info, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-civic-blue selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-civic-blue" />
            <span className="font-bold text-xl tracking-tight text-civic-blue">SafeRoute Montgomery</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-civic-blue transition-colors">Features</a>
            <a href="#data" className="hover:text-civic-blue transition-colors">Data Transparency</a>
            <button 
              onClick={onStart}
              className="bg-civic-blue text-white px-5 py-2 rounded-full hover:bg-slate-800 transition-all shadow-sm"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-template-columns-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-civic-blue text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-civic-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-civic-blue"></span>
              </span>
              AI-Powered Civic Safety
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
              Navigate Montgomery with <span className="text-civic-blue">Confidence.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
              SafeRoute Montgomery uses real-time public safety data and AI to help you choose the safest path, not just the fastest one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="group bg-civic-blue text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-blue-900/10"
              >
                Find a Safer Route
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#how-it-works"
                className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 transition-all"
              >
                Learn How it Works
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-slate-100 overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://picsum.photos/seed/montgomery/1200/1200" 
                alt="Montgomery Cityscape" 
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-civic-blue/40 to-transparent" />
              
              {/* Floating UI Elements */}
              <div className="absolute top-10 left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[200px] animate-bounce-slow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-safety-green" />
                  <span className="text-[10px] font-bold uppercase text-slate-400">Safety Score</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">94/100</div>
                <div className="text-[10px] text-slate-500 mt-1">Recommended Route</div>
              </div>

              <div className="absolute bottom-10 right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[220px] animate-float">
                <div className="flex items-center gap-2 mb-2 text-civic-blue">
                  <Navigation className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">AI Insight</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  "This route avoids areas with elevated 911 activity in the last 6 hours."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Smarter Decisions for Public Travel</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We integrate official City of Montgomery datasets to provide a comprehensive view of your environment.
            </p>
          </div>

          <div className="grid md:grid-template-columns-3 gap-8">
            {[
              {
                icon: <AlertTriangle className="w-6 h-6 text-safety-yellow" />,
                title: "Real-Time Risk Analysis",
                desc: "Analyzes recent 911 calls, crime density, and emergency incidents along your path."
              },
              {
                icon: <Info className="w-6 h-6 text-civic-blue" />,
                title: "AI Safety Explanations",
                desc: "Complex data translated into plain-language insights so you understand the 'why' behind every route."
              },
              {
                icon: <MapPin className="w-6 h-6 text-safety-green" />,
                title: "Emergency Awareness",
                desc: "Highlights nearby hospitals, shelters, and response facilities for peace of mind."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section id="data" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-civic-blue rounded-[2rem] p-12 md:p-20 text-white overflow-hidden relative">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Trust & Transparency</h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                SafeRoute Montgomery is built on official public data from the City of Montgomery Open Data Portal. Our AI focuses on summarizing facts, not predicting behavior.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">Fact-Based</div>
                    <div className="text-sm text-blue-200">No predictive profiling</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">Open Data</div>
                    <div className="text-sm text-blue-200">Official city sources</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-civic-blue" />
            <span className="font-bold text-slate-900">SafeRoute Montgomery</span>
          </div>
          <div className="text-slate-400 text-sm">
            © 2026 SafeRoute Montgomery. Built for the Montgomery Civic Hackathon.
          </div>
        </div>
      </footer>
    </div>
  );
}
