import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer role="contentinfo" className="w-full bg-[#E5E7EB] border-t border-gray-300">
      <div className="flex flex-col md:flex-row justify-between items-center py-10 px-8 max-w-7xl mx-auto text-sm">
        <div className="mb-6 md:mb-0">
          <div className="text-xl font-black text-[#0053cd] mb-1">Disaster Awareness</div>
          <p className="text-gray-500 font-medium">© 2026 Disaster Awareness. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-semibold text-gray-500">
          <Link href="/about" className="hover:text-black transition-colors">About Us</Link>
          <Link href="/satellite-hub" className="hover:text-black transition-colors">Satellite Hub</Link>
          <Link href="/types-of-disasters" className="hover:text-black transition-colors">Reference Guide</Link>
          <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
