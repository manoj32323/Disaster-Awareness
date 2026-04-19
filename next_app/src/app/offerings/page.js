import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'Capabilities — Disaster Awareness',
  description: 'Discover how the Disaster Awareness platform integrates dual-band NDWI flood mapping with Sentinel-2, Landsat-8, and Resourcesat-2 satellite intelligence for governments and relief agencies.',
};

export default function OfferingsPage() {
  return (
    <main id="main-content" className="bg-white min-h-screen text-slate-800">
      <section className="bg-slate-50 py-24 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Platform Capabilities
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Discover how our AI ecosystem integrates high-speed data delivery with unparalleled machine learning precision for disaster response.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl border border-gray-100">
            <Image 
              src="/2024/06/pexels-photo-10629414-10629414.jpg" 
              alt="Aerial view of a disaster relief camp with tents and aid distribution" 
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-8">
             <div>
               <h3 className="text-2xl font-bold text-slate-900 mb-3">Satellite-Based Flood Mapping</h3>
               <p className="text-slate-600 leading-relaxed">
                 By processing incoming Sentinel-1 SAR and Sentinel-2 multispectral data, our pipeline computes dual-band NDWI (Green − NIR/SWIR) to isolate flood extents across affected regions. Rasterio and GDAL handle radiometric pre-processing, while results are cross-validated in QGIS and ESA SNAP before dispatch.
               </p>
             </div>
             <div>
               <h3 className="text-2xl font-bold text-slate-900 mb-3">Enterprise Dashboard Integrations</h3>
               <p className="text-slate-600 leading-relaxed">
                 Our cloud-native architecture ensures that governments and relief agencies can securely load complex geographic algorithms without browser latency, enabling instant access to critical intelligence.
               </p>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}
