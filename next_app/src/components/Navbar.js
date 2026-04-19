"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/live-map', label: 'Live 3D Map' },
  { href: '/types-of-disasters', label: 'Reference Guide' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Skip-to-content link for keyboard/screen reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav aria-label="Main navigation" className="w-full top-0 sticky z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center h-20 px-6 lg:px-8 max-w-7xl mx-auto">
          <Link href="/" aria-label="Disaster Awareness — Home">
            <div className="text-2xl font-black text-[#0053cd] tracking-tighter">
              Disaster Awareness
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10 font-bold tracking-tight text-gray-500">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors border-b-2 pb-1 ${
                  pathname === link.href
                    ? 'text-[#0053cd] border-[#0053cd]'
                    : 'border-transparent hover:text-[#0053cd] focus:text-[#0053cd]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/satellite-hub" className="hidden sm:block">
              <button
                aria-label="Access the Satellite Hub network"
                className="bg-gradient-to-br from-[#0053cd] to-[#086afe] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform hover:shadow-xl"
              >
                Access Network
              </button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg animate-in slide-in-from-top duration-200">
            <div className="flex flex-col px-6 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 px-4 rounded-xl font-bold text-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-blue-50 text-[#0053cd]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/satellite-hub"
                onClick={() => setMobileOpen(false)}
                className="mt-4 block"
              >
                <button className="w-full bg-gradient-to-br from-[#0053cd] to-[#086afe] text-white py-3 rounded-xl font-bold shadow-lg">
                  Access Network
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
