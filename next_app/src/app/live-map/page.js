"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from './ErrorBoundary';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function LiveMap() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    setMounted(true);
    const host = window.location.hostname === "localhost" ? "127.0.0.1" : (window.location.hostname || "127.0.0.1");
    
    fetch(`http://${host}:8000/api/alerts`)
      .then(res => {
         if (!res.ok) throw new Error("Backend API unreachable");
         return res.json();
      })
      .then(data => {
        if(data && data.alerts) setAlerts(data.alerts);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Sync Error:", err);
        setApiError("Could not connect to the live data feed. Displaying cached sample data.");
        setAlerts([
          { title: "Flood Warning — Southeast Asia", description: "Heavy monsoon rains causing widespread flooding across river deltas.", date: "Sample Data", lat: 15.0, lng: 105.0, severity: "Red" },
          { title: "Cyclone Alert — Atlantic", description: "Tropical cyclone forming with sustained winds exceeding 120 km/h.", date: "Sample Data", lat: 25.0, lng: -70.0, severity: "Orange" },
          { title: "Storm Surge — Japan", description: "High waves and coastal flooding expected along eastern shoreline.", date: "Sample Data", lat: 35.0, lng: 139.0, severity: "Green" }
        ]);
        setLoading(false);
      });
  }, []);

  if (!mounted) return <div className="h-[calc(100vh-80px)] w-full bg-slate-900" />;

  return (
    <main id="main-content" className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-[#030e21]">
      
      {/* BACKGROUND LAYER: 3D Globe Visualization */}
      <div className="absolute inset-0 z-0">
         <ErrorBoundary>
           <Globe
             globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
             bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
             backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
             pointsData={alerts}
             pointLat="lat"
             pointLng="lng"
             pointColor={(d) => d && d.severity === 'Red' ? '#EF4444' : d && d.severity === 'Orange' ? '#F97316' : '#22C55E'}
             pointAltitude={0.1}
             pointRadius={0.4}
             pointsMerge={true}
           />
         </ErrorBoundary>
      </div>

      {/* OVERLAY LAYER 1: Header Badge */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-blue-400">Live Telemetry Feed</span>
          </div>
          <h1 className="text-3xl font-black text-white/95">Global Threat Map</h1>
          <p className="mt-2 text-gray-400 text-sm max-w-xs">
            Real-time disaster alerts from GDACS and satellite monitoring networks.
          </p>
        </div>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 bg-amber-500/90 backdrop-blur-md text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg max-w-md text-center">
          {apiError}
        </div>
      )}

      {/* OVERLAY LAYER 2: Insights Sidebar */}
      <aside className="absolute right-0 top-0 bottom-0 z-20 w-full md:w-[450px] bg-white/95 backdrop-blur-lg border-l border-gray-200 shadow-2xl flex flex-col transform transition-transform duration-500 translate-y-3/4 md:translate-y-0 rounded-t-[3rem] md:rounded-none" aria-label="Global threat log sidebar">
        
        {/* Sidebar Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Global Threat Log</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time sync from GDACS</p>
          </div>
          <span className="bg-red-50 text-red-600 text-[10px] px-3 py-1 rounded-full font-black border border-red-100 tracking-tighter uppercase">
            {alerts.length} Detected
          </span>
        </div>

        {/* Sidebar Alerts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 space-y-6">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Syncing Feed...</p>
             </div>
          ) : (
            alerts.map((alert, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1 border-l-4 border-l-blue-500/0 hover:border-l-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${alert.severity === 'Red' ? 'bg-red-50 text-red-600' : alert.severity === 'Orange' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                    {alert.severity || "Log Entry"}
                  </span>
                  <span className="text-gray-400 text-xs font-medium">{alert.date}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{alert.title}</h3>
                <div className="mt-4 flex items-center gap-2 text-slate-500 text-[11px] font-mono bg-slate-50 py-2 px-3 rounded-xl inline-flex border border-slate-100">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {alert && alert.lat !== undefined ? Number(alert.lat).toFixed(4) : "0.00"}° N | {alert && alert.lng !== undefined ? Number(alert.lng).toFixed(4) : "0.00"}° E
                </div>
                <p className="text-sm mt-4 text-slate-600 leading-relaxed font-medium">
                  {alert && alert.description ? alert.description : "Awaiting detailed sensor payload."}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer CTA */}
        <div className="p-8 border-t border-gray-100 bg-slate-50/50">
          <button 
            className="w-full bg-[#111827] text-white font-black py-4 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-sm uppercase tracking-widest"
            aria-label="Export a report of the current sector data"
          >
            Export Sector Report
          </button>
        </div>
      </aside>

    </main>
  );
}
