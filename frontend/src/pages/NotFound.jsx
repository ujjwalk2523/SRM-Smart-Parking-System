import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center mx-auto shadow-sm">
          <Car className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-[var(--text-primary)]">404</h1>
        <h2 className="text-xl font-bold text-[var(--text-secondary)]">Parking Bay Not Found</h2>
        <p className="text-xs text-[var(--text-muted)]">
          The page or facility you were looking for doesn't exist or has moved within the campus grid.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
