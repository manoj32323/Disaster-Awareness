import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'About — Disaster Awareness',
  description: 'Our mission to protect communities through satellite remote sensing (Sentinel-2, Landsat-8, Resourcesat-2), AI-powered flood detection, and emergency response coordination.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-white min-h-screen text-slate-800">
      <section className="bg-slate-50 py-24 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Empowering Relief Through Technology
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            Guided by our principles, we seek to provide rapid technological assistance to disaster response efforts globally.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Building a Strong Foundation</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Our central mission is to implement cutting-edge predictive software — processing multispectral imagery from Sentinel-2, Landsat-8, and Resourcesat-2 — to protect communities at the deepest level. By computing dual-band NDWI and SAR backscatter analysis, we build a network of support that strengthens resiliency against the worst natural catastrophes.
          </p>
          <p className="text-slate-600 leading-relaxed">
            The integration of satellite data processed through Rasterio, GDAL, and GeoPandas, with results verified in QGIS and ESA SNAP, directly connects to emergency responder telemetry — unlocking unprecedented flood detection capabilities that help prevent casualties before the storm hits.
          </p>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] relative rounded-lg overflow-hidden shadow-xl border border-gray-100">
            <Image 
              src="/2024/06/pexels-photo-3856027-3856027.jpg" 
              alt="Community members gathering during a disaster relief coordination effort" 
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="hover:scale-105 transition-transform duration-700" 
            />
          </div>
        </div>
      </section>
    </main>
  );
}
