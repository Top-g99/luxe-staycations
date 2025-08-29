"use client";

import Link from 'next/link';
import React, { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left Side */}
          <Link href="/" className="flex items-center gap-4 flex-shrink-0">
            <div className="text-4xl font-bold text-black underline">L</div>
            <div className="flex flex-col">
              <span className="text-[#704F49] text-lg font-bold underline">
                Luxe Staycations
              </span>
              <span className="text-[#704F49] text-sm underline">
                Luxury Redefined
              </span>
            </div>
          </Link>

          {/* Right Side - Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
              Home
            </Link>
            <Link href="/villas" className="text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
              Villas
            </Link>
            <Link href="/about-us" className="text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
              About Us
            </Link>
            <Link href="/blog" className="text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
              Blog
            </Link>
            <Link href="/partner-with-us" className="text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
              Partner With Us
            </Link>
            <Link href="/contact-us" className="text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
              Contact Us
            </Link>
            <Link href="/admin" className="text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
              Admin
            </Link>
            <Link 
              href="/guest/login" 
              className="bg-[#704F49] text-white px-4 py-2 rounded hover:bg-[#5A3F3A] font-medium"
            >
              Manage Your Booking
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#704F49] hover:text-[#5A3F3A] p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <Link href="/" className="block text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
                Home
              </Link>
              <Link href="/villas" className="block text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
                Villas
              </Link>
              <Link href="/about-us" className="block text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
                About Us
              </Link>
              <Link href="/blog" className="block text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
                Blog
              </Link>
              <Link href="/partner-with-us" className="block text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
                Partner With Us
              </Link>
              <Link href="/contact-us" className="block text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
                Contact Us
              </Link>
              <Link href="/admin" className="block text-[#704F49] hover:text-[#5A3F3A] underline font-medium">
                Admin
              </Link>
              <Link
                href="/guest/login"
                className="block bg-[#704F49] text-white px-4 py-2 rounded hover:bg-[#5A3F3A] font-medium text-center"
              >
                Manage Your Booking
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
