"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingDashboard() {
  return (
    <main id="main-content" className="max-w-7xl mx-auto px-8 py-20">
      {/* Hero Header Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24 relative isolate">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#90c0ff] to-[#0053cd] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 backdrop-blur-sm text-blue-800 text-xs font-bold uppercase tracking-widest border border-blue-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            Live Global Sensors Active
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.05]">
            Empowering Responders via <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0053cd] to-[#086afe]">Disaster Relief</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed font-medium max-w-xl">
            Harnessing next-generation AI to protect communities worldwide with real-time disaster intelligence and predictive analytics.
          </p>
          
          <div className="flex flex-wrap items-center gap-5 pt-4">
            <Link href="/satellite-hub" aria-label="Go to the Satellite Telemetry Hub">
              <button className="bg-[#111827] text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all">
                Initiate Diagnostic
              </button>
            </Link>
            <Link href="/about" aria-label="Learn more about Disaster Awareness">
              <button className="bg-white border border-gray-200 text-gray-800 px-8 py-4 rounded-xl font-bold shadow-sm hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all">
                View Analytics
              </button>
            </Link>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block">
           <div className="absolute -inset-4 bg-gradient-to-r from-[#0053cd]/20 to-blue-400/20 rounded-[2.5rem] blur-2xl"></div>
           <div className="relative w-full aspect-[4/3] rounded-[2rem] shadow-2xl border-4 border-white/80 bg-white/50 backdrop-blur-3xl overflow-hidden flex items-center justify-center">
             <Image 
               src="/2024/10/rescue-team-on-rubber-boat-260nw-1901926318-e1729531918115.webp" 
               alt="A rescue team navigating flood waters in a rubber boat during disaster relief operations" 
               fill
               style={{ objectFit: "cover" }}
               sizes="(max-width: 1024px) 100vw, 50vw"
               priority
             />
           </div>
        </div>
      </section>

      {/* Grid Dashboard Tiles */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Module 1 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-gray-50/50 flex flex-col">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Satellite Telemetry Hub</h3>
          <p className="text-gray-500 font-medium leading-relaxed mb-8 flex-1">
            Upload Sentinel-2, Landsat-8, or Resourcesat-2 imagery for instant dual-band NDWI flood zone detection and water body delineation.
          </p>
          <Link href="/satellite-hub" aria-label="Access the Satellite Telemetry Hub">
            <button className="text-blue-600 font-bold flex items-center gap-2 group">
              Access Hub 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </Link>
        </div>

        {/* Module 2 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-gray-50/50 flex flex-col">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-2xl">bolt</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Global Map</h3>
          <p className="text-gray-500 font-medium leading-relaxed mb-8 flex-1">
            Interactive 3D globe visualization powered by live satellite feeds and advanced predictive algorithms.
          </p>
          <Link href="/live-map" aria-label="Launch the 3D globe live map view">
            <button className="text-blue-600 font-bold flex items-center gap-2 group">
              Launch Globe View 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </Link>
        </div>

        {/* Module 3 (Premium Glass CTA) */}
        <div className="bg-gradient-to-br from-[#0053cd] to-[#086afe] p-8 rounded-3xl shadow-xl shadow-blue-500/20 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex-1">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <span className="material-symbols-outlined text-2xl text-white">shield</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Secure Agency Connect</h3>
            <p className="text-blue-100 font-medium leading-relaxed">
              Connect with our operations center for partnership inquiries, data access, and response coordination.
            </p>
          </div>
          <Link href="/contact" className="w-full mt-8 flex" aria-label="Contact our operations center">
            <button className="w-full bg-white text-[#0053cd] py-4 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all">
              Get in Touch
            </button>
          </Link>
        </div>

      </section>
    </main>
  );
}
