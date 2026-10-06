import React from 'react';
import { ShieldCheck, Phone, MapPin, Compass, Car, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';

export const Footer = () => {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Campus Info */}
          <div className="space-y-3 md:col-span-2">
            <BrandLogo size="md" />
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-sm leading-relaxed">
              Official campus parking management and slot reservation portal for students, faculty, staff, and campus visitors across designated SRM KTR campus facilities.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> GST Road, Potheri, Chengalpattu Dt.
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" /> Transport Helpline: +91 44 2745 2270
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">
              Campus Services
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link to="/explore" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Find Campus Parking</span>
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>My Slot Reservations</span>
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Registered Campus Vehicles</span>
                </Link>
              </li>
              <li>
                <Link to="/active-session" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Active Parking Session</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* SRM KTR Campus Sectors */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">
              Campus Sectors
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>• Tech Park & University Building</li>
              <li>• Intra College Road & Clock Tower</li>
              <li>• College Road & Food Court Quad</li>
              <li>• Potheri Gate & Railway Cross</li>
              <li>• Paari / Oori Hostel Perimeter</li>
              <li>• University Bus Depo & Terminal</li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-3">
          <p>© {new Date().getFullYear()} SRM Institute of Science and Technology. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Campus Security Monitored
            </span>
            <span>•</span>
            <span>Kattankulathur - 603203</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
