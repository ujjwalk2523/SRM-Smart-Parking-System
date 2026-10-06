import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { sessionsApi } from '../../api/sessions';
import { 
  Car, 
  MapPin, 
  CalendarCheck, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  User, 
  Menu, 
  X,
  LayoutDashboard,
  Sun,
  Moon,
  GraduationCap
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      sessionsApi.getActive()
        .then((res) => {
          if (isMounted) setActiveSession(res?.data);
        })
        .catch(() => {});
    } else {
      setActiveSession(null);
    }
    return () => { isMounted = false; };
  }, [isAuthenticated, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    ...(isAuthenticated ? [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ] : []),
    { name: 'Find Parking', path: '/explore', icon: MapPin },
    ...(isAuthenticated ? [
      { name: 'My Bookings', path: '/bookings', icon: CalendarCheck },
      { name: 'Vehicles', path: '/vehicles', icon: Car },
      { name: 'Profile', path: '/profile', icon: User },
    ] : []),
    ...(isAdmin ? [
      { name: 'Admin Hub', path: '/admin', icon: ShieldCheck },
    ] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="focus:outline-none">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[var(--surface-secondary)] rounded-lg -z-10 border border-[var(--border)] shadow-xs"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Controls: Theme Switch, Active Session Pill, Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Smooth Animated Theme Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors border border-[var(--border)] cursor-pointer"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle Theme Mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="dark"
                    initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="light"
                    initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-[var(--text-primary)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Active Parking Session Pill */}
            {activeSession && (
              <Link
                to="/active-session"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success-text)] text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Bay {activeSession.slotNumber} Active</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 pl-2.5 border-l border-[var(--border)]">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 hover:opacity-90 transition p-1 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--accent-text)] flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-[var(--text-primary)] line-clamp-1 max-w-[110px]">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                      {isAdmin ? 'Campus Admin' : 'Campus Driver'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90 shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme Toggle & Hamburger */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-lg transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--text-primary)]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 pt-3 pb-5 space-y-1.5 overflow-hidden"
          >
            {activeSession && (
              <Link
                to="/active-session"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 mb-2 rounded-xl bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success-text)] text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Bay {activeSession.slotNumber} Occupied (Live Session)</span>
                </div>
                <span>View →</span>
              </Link>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive(link.path)
                      ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-[var(--border)]">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/10 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user?.fullName})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)] rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-bold bg-[var(--accent)] text-[var(--accent-text)] rounded-xl"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
