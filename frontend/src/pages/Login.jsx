import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const Login = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.fullName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md space-y-6"
      >
        
        {/* Top Header */}
        <div className="text-center flex flex-col items-center">
          <BrandLogo size="lg" className="justify-center mb-3" />
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            Sign In to SRM SmartPark
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Kattankulathur Campus Parking & Reservation Portal
          </p>
        </div>

        {/* Form Container */}
        <div className="card-surface p-6 sm:p-8 rounded-2xl space-y-6 border border-[var(--border)] shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                SRM Email / User ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student.ktr@srmist.edu.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl app-input text-xs font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl app-input text-xs font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="btn-primary w-full mt-2 py-3 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[var(--accent-text)]/20 border-t-[var(--accent-text)] rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-[var(--border)] space-y-2">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block text-center">
              Quick One-Click Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student.ktr@srmist.edu.in', 'User@123')}
                className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] hover:border-[var(--border-secondary)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Student (Aarav)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@srmist.edu.in', 'Admin@123')}
                className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] hover:border-[var(--border-secondary)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Campus Admin</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[var(--text-muted)]">
            Need campus parking access?{' '}
            <Link to="/register" className="font-bold text-[var(--text-primary)] underline">
              Register Student / Staff
            </Link>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
