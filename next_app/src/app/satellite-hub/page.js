"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import AlertBanner from '@/components/AlertBanner';

export default function SatelliteHubPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedOverlay, setProcessedOverlay] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [geoMetadata, setGeoMetadata] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [floodStats, setFloodStats] = useState(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
       const selectedFile = e.target.files[0];
       
       // Validate file size (max 50MB)
       if (selectedFile.size > 50 * 1024 * 1024) {
         setAlertState({ type: 'error', message: 'File exceeds 50MB limit. Please choose a smaller file.' });
         return;
       }
       
       setFile(selectedFile);
       setPreviewUrl(URL.createObjectURL(selectedFile));
       setProcessedOverlay(null);
       setAlertState(null);
       setGeoMetadata(null);
       setGeojsonData(null);
       setFloodStats(null);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreviewUrl(null);
    setProcessedOverlay(null);
    setGeoMetadata(null);
    setGeojsonData(null);
    setFloodStats(null);
  };

  const downloadGeoJSON = () => {
    if (!geojsonData) return;
    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flood_mask.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processTelemetry = async () => {
    if (!file) return;

    setIsProcessing(true);
    setAlertState(null);
    setGeoMetadata(null);
    setGeojsonData(null);
    setFloodStats(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
       const host = window.location.hostname === "localhost" ? "127.0.0.1" : (window.location.hostname || "127.0.0.1");
       const response = await fetch(`http://${host}:8000/api/predict`, {
         method: "POST",
         body: formData,
       });
       
       if (!response.ok) {
          throw new Error("Failed to process satellite imagery.");
       }

       const data = await response.json();
       if (data.mask_overlay) {
          setProcessedOverlay(data.mask_overlay);
          setAlertState({ type: 'success', message: 'Flood segmentation analysis complete. Results are displayed below.' });
       }
       if (data.geo_metadata) {
          setGeoMetadata(data.geo_metadata);
       }
       if (data.geojson) {
          setGeojsonData(data.geojson);
       }
       if (data.flood_percentage !== undefined) {
          setFloodStats({
            flood_percentage: data.flood_percentage,
            total_pixels: data.total_pixels,
            flood_pixels: data.flood_pixels,
          });
       }
    } catch(err) {
       console.error(err);
       setAlertState({ 
         type: 'error', 
         message: 'Could not connect to the prediction server. Please ensure the backend (run_server.py) is running on port 8000.' 
       });
    } finally {
       setIsProcessing(false);
    }
  };

  return (
    <main id="main-content" className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      <section className="py-24 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Satellite Telemetry Hub
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Upload GeoTIFF (.tif) or standard imagery from Sentinel-2, Landsat-8, or Resourcesat-2. 
            Multi-band inputs trigger true dual-band NDWI; RGB falls back to proxy NDWI.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 mt-8">
        {/* Alert Banner */}
        {alertState && (
          <div className="mb-8">
            <AlertBanner 
              type={alertState.type} 
              message={alertState.message} 
              onDismiss={() => setAlertState(null)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Input Module */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-center items-center h-[500px] border-dashed border-2 hover:border-blue-500 transition-colors relative">
             {!previewUrl ? (
               <>
                 <span className="material-symbols-outlined text-6xl text-blue-500 mb-6">cloud_upload</span>
                 <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Data Pack</h3>
                 <p className="text-slate-500 text-center mb-4 px-4">
                   Supported: JPEG, PNG, GeoTIFF (.tif). Max 50MB.
                 </p>
                 <p className="text-xs text-slate-400 text-center mb-6 px-6">
                   GeoTIFF with ≥4 bands enables true NDWI (Green−NIR). RGB uses proxy NDWI.
                 </p>
                 
                 <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95">
                   Browse Files
                   <input type="file" className="hidden" accept="image/png, image/jpeg, image/tiff, .tif, .tiff" onChange={handleFileSelect} aria-label="Select a satellite image file to upload"/>
                 </label>
               </>
             ) : (
               <div className="w-full h-full relative cursor-pointer" onClick={resetAll}>
                 <Image src={previewUrl} fill style={{ objectFit: "contain" }} alt="Preview of the uploaded satellite image" className="p-4" sizes="(max-width: 768px) 100vw, 50vw" />
                 <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg shadow-red-500/50 hover:bg-red-600 transition-colors" aria-label="Remove uploaded file">
                   ✕
                 </div>
                 {/* File type badge */}
                 <div className="absolute bottom-4 left-4 bg-slate-800/80 text-white text-xs font-mono px-3 py-1 rounded-lg backdrop-blur-sm">
                   {file?.name?.toLowerCase().endsWith('.tif') || file?.name?.toLowerCase().endsWith('.tiff') 
                     ? '📡 GeoTIFF' 
                     : '🖼️ RGB Image'}
                 </div>
               </div>
             )}
          </div>

          {/* Processing & Output Module */}
          <div className="flex flex-col space-y-6">
             <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-md">
               <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                 Inference Dashboard
               </h3>
               <p className="text-slate-600 text-sm mb-6">
                 GeoTIFF inputs are processed with Rasterio (GDAL). Multi-band
                 images use dual-band NDWI; results are vectorized to GeoJSON via GeoPandas.
               </p>
               
               <button 
                 onClick={processTelemetry}
                 disabled={!file || isProcessing}
                 className={`w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md active:scale-95 ${(!file || isProcessing) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'}`}
                 aria-label={isProcessing ? 'Processing satellite image' : 'Run the flood segmentation model'}
               >
                 {isProcessing ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     Analyzing Topology...
                   </>
                 ) : 'Run Segmentation Model'}
               </button>
             </div>

             {/* Result Module */}
             {processedOverlay && (
               <div className="bg-white p-4 rounded-[2rem] border border-green-100 shadow-xl relative aspect-[4/3] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                  <Image src={processedOverlay} fill style={{ objectFit: "contain" }} alt="AI-generated flood segmentation mask overlaid on the original satellite image" className="rounded-2xl p-2" sizes="(max-width: 768px) 100vw, 50vw" />
                  <div className="absolute top-6 left-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Analysis Complete
                  </div>
               </div>
             )}

             {/* Flood Statistics */}
             {floodStats && (
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-md">
                 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <span className="material-symbols-outlined text-lg text-blue-600">analytics</span>
                   Flood Detection Metrics
                 </h4>
                 <div className="grid grid-cols-3 gap-4">
                   <div className="text-center p-3 bg-blue-50 rounded-xl">
                     <div className="text-2xl font-black text-blue-700">{floodStats.flood_percentage}%</div>
                     <div className="text-xs text-slate-500 font-medium mt-1">Flood Coverage</div>
                   </div>
                   <div className="text-center p-3 bg-cyan-50 rounded-xl">
                     <div className="text-2xl font-black text-cyan-700">{floodStats.flood_pixels?.toLocaleString()}</div>
                     <div className="text-xs text-slate-500 font-medium mt-1">Flood Pixels</div>
                   </div>
                   <div className="text-center p-3 bg-slate-50 rounded-xl">
                     <div className="text-2xl font-black text-slate-700">{floodStats.total_pixels?.toLocaleString()}</div>
                     <div className="text-xs text-slate-500 font-medium mt-1">Total Pixels</div>
                   </div>
                 </div>
               </div>
             )}

             {/* Geospatial Metadata Panel */}
             {geoMetadata && (
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-md">
                 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <span className="material-symbols-outlined text-lg text-emerald-600">satellite_alt</span>
                   Raster Metadata
                 </h4>
                 <div className="space-y-2.5 text-sm">
                   <MetadataRow label="Format" value={geoMetadata.format} />
                   {geoMetadata.crs_original && (
                     <MetadataRow label="CRS (Original)" value={geoMetadata.crs_original} />
                   )}
                   {geoMetadata.reprojected_to && (
                     <MetadataRow label="Reprojected To" value={geoMetadata.reprojected_to} highlight />
                   )}
                   {geoMetadata.band_count && (
                     <MetadataRow label="Bands" value={geoMetadata.band_count} />
                   )}
                   {geoMetadata.dimensions && (
                     <MetadataRow label="Dimensions" value={geoMetadata.dimensions} />
                   )}
                   {geoMetadata.resolution_m && (
                     <MetadataRow label="Resolution" value={`${geoMetadata.resolution_m.x}m × ${geoMetadata.resolution_m.y}m`} />
                   )}
                   {geoMetadata.ndwi_method && (
                     <MetadataRow label="NDWI Method" value={geoMetadata.ndwi_method} highlight />
                   )}
                   {geoMetadata.bands_used && (
                     <MetadataRow 
                       label="Bands Used" 
                       value={
                         geoMetadata.bands_used.nir 
                           ? `Green (B${geoMetadata.bands_used.green}) + NIR (B${geoMetadata.bands_used.nir})`
                           : `Green (B${geoMetadata.bands_used.green}) + Red as NIR proxy (B${geoMetadata.bands_used.red_as_nir_proxy})`
                       } 
                     />
                   )}
                   {geoMetadata.geojson_features !== undefined && (
                     <MetadataRow label="GeoJSON Features" value={geoMetadata.geojson_features} />
                   )}
                   {geoMetadata.bounds && (
                     <div className="pt-2 border-t border-gray-100 mt-2">
                       <div className="text-xs font-semibold text-slate-500 mb-1">Bounding Box</div>
                       <div className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                         ({geoMetadata.bounds.left}, {geoMetadata.bounds.bottom}) → ({geoMetadata.bounds.right}, {geoMetadata.bounds.top})
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* GeoJSON Download */}
             {geojsonData && geojsonData.features && geojsonData.features.length > 0 && (
               <button
                 onClick={downloadGeoJSON}
                 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-3 transition-all shadow-md active:scale-95"
                 aria-label="Download flood mask as GeoJSON file"
               >
                 <span className="material-symbols-outlined text-xl">download</span>
                 Download Flood Mask (GeoJSON)
                 <span className="text-emerald-200 text-sm font-medium">
                   — {geojsonData.features.length} features
                 </span>
               </button>
             )}
          </div>
        </div>
      </section>
    </main>
  );
}


/** Reusable metadata row component */
function MetadataRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-slate-500 font-medium shrink-0">{label}</span>
      <span className={`text-right font-semibold break-all ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>
        {String(value)}
      </span>
    </div>
  );
}
