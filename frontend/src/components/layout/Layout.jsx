import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200">
      <Navbar />
      <main className="flex-grow flex flex-col w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
