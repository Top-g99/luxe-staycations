"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { settingsManager, BusinessProfile } from '@/lib/settingsManager';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load business profile to get the logo
    if (typeof window !== 'undefined') {
      try {
        settingsManager.initialize();
        const profile = settingsManager.getBusinessProfile();
        setBusinessProfile(profile);
        
        // Subscribe to settings changes
        const unsubscribe = settingsManager.subscribe(() => {
          const updatedProfile = settingsManager.getBusinessProfile();
          setBusinessProfile(updatedProfile);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error loading business profile:', error);
      }
    }
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black/60 backdrop-blur-xl shadow-none w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left Side */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            {businessProfile?.logo && (
              <img 
                src={businessProfile.logo} 
                alt="Luxe Staycations Logo" 
                className="w-8 h-8 object-contain"
                style={{ 
                  maxWidth: '32px', 
                  maxHeight: '32px',
                  filter: 'none' // Preserve original colors and content
                }}
              />
            )}
            <div className="flex flex-col">
              <span className="text-white text-lg font-bold">
                Luxe Staycations
              </span>
            </div>
          </Link>

          {/* Right Side - Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <button 
              onClick={() => router.push('/')}
              className="text-white hover:text-gray-300 font-medium transition-colors duration-200"
            >
              Home
            </button>
            <button 
              onClick={() => router.push('/villas')}
              className="text-white hover:text-gray-300 font-medium transition-colors duration-200"
            >
              Villas
            </button>
            <button 
              onClick={() => router.push('/about-us')}
              className="text-white hover:text-gray-300 font-medium transition-colors duration-200"
            >
              About Us
            </button>
            <button 
              onClick={() => router.push('/blog')}
              className="text-white hover:text-gray-300 font-medium transition-colors duration-200"
            >
              Blog
            </button>
            <button 
              onClick={() => router.push('/contact-us')}
              className="text-white hover:text-gray-300 font-medium transition-colors duration-200"
            >
              Contact Us
            </button>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button 
              onClick={() => router.push('/partner-with-us')}
              className="text-white hover:text-gray-300 font-medium transition-colors duration-200"
            >
              Partner With Us
            </button>
            <button 
              onClick={() => router.push('/guest/login')}
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 font-medium transition-all duration-200 hover:scale-105"
            >
              Manage Your Booking
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 p-2"
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
          <div className="lg:hidden bg-black/60 backdrop-blur-xl border-t border-white/20">
            <div className="px-4 py-4">
              {/* Main Navigation */}
              <div className="space-y-3 mb-6">
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Navigation
                </div>
                <button 
                  onClick={() => {
                    router.push('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-white hover:text-gray-300 font-medium text-left w-full transition-colors duration-200"
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    router.push('/villas');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-white hover:text-gray-300 font-medium text-left w-full transition-colors duration-200"
                >
                  Villas
                </button>
                <button 
                  onClick={() => {
                    router.push('/about-us');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-white hover:text-gray-300 font-medium text-left w-full transition-colors duration-200"
                >
                  About Us
                </button>
                <button 
                  onClick={() => {
                    router.push('/blog');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-white hover:text-gray-300 font-medium text-left w-full transition-colors duration-200"
                >
                  Blog
                </button>
                <button 
                  onClick={() => {
                    router.push('/contact-us');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-white hover:text-gray-300 font-medium text-left w-full transition-colors duration-200"
                >
                  Contact Us
                </button>
              </div>

              {/* Account & Admin */}
              <div className="space-y-3 mb-6">
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Account & Admin
                </div>
                <button 
                  onClick={() => {
                    router.push('/partner-with-us');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-white hover:text-gray-300 font-medium text-left w-full transition-colors duration-200"
                >
                  Partner With Us
                </button>
                <button
                  onClick={() => {
                    router.push('/guest/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block bg-white text-black px-4 py-2 rounded hover:bg-gray-200 font-medium text-center w-full transition-all duration-200 hover:scale-105"
                >
                  Manage Your Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
