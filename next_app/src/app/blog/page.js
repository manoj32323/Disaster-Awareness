import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Research & Insights — Disaster Awareness',
  description: 'Latest research, insights, and case studies on AI-powered disaster intelligence, flood mapping, and emergency response technologies.',
};

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      slug: 'ai-satellite-flood-detection',
      title: "How AI Satellite Imagery Detects Flood Zones Before They Form",
      date: "April 5, 2026",
      summary: "Exploring how Sentinel-1 SAR and Sentinel-2 multispectral data processed through dual-band NDWI computation can delineate flood zones with 89.3% IoU accuracy.",
      author: "Data Science Team"
    },
    {
      id: 2,
      slug: 'real-time-cyclone-tracking',
      title: "Real-Time Cyclone Tracking: How 3D Mapping Saves Lives",
      date: "March 20, 2026",
      summary: "How fusing Sentinel-1, Sentinel-2, and Landsat-8 data produces quantitative flood extent maps — with Kerala, Michaung, and Godavari Basin validation results.",
      author: "Research Division"
    },
    {
      id: 3,
      slug: 'evolution-of-early-warning',
      title: "From Manual to Automated: The Evolution of Disaster Early Warning",
      date: "February 15, 2026",
      summary: "A retrospective on how disaster warning systems have evolved from manual observations to AI-driven predictive platforms over the past decade.",
      author: "Engineering Lead"
    }
  ];

  return (
    <main id="main-content" className="bg-white min-h-screen text-slate-800">
      <section className="bg-slate-50 py-20 border-b border-gray-100">
         <div className="max-w-4xl mx-auto px-8 text-center">
           <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
             Research & Insights
           </h1>
           <p className="text-lg text-slate-600 font-medium mt-4">Latest case studies and technical deep-dives from our research team.</p>
         </div>
      </section>

      <section className="py-20 max-w-5xl mx-auto px-8">
         <div className="space-y-12">
            {posts.map(post => (
              <article key={post.id} className="border-b border-gray-100 pb-12 group">
                 <header className="mb-4">
                   <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">schedule</span>
                     {post.date}
                   </div>
                   <Link href={`/blog/${post.slug}`} className="block">
                     <h2 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">
                       {post.title}
                     </h2>
                   </Link>
                 </header>
                 <p className="text-slate-600 leading-relaxed text-lg mb-4">
                   {post.summary}
                 </p>
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-medium text-slate-500">By {post.author}</span>
                   <Link href={`/blog/${post.slug}`} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                     Read More <span>→</span>
                   </Link>
                 </div>
              </article>
            ))}
         </div>
      </section>
    </main>
  );
}
