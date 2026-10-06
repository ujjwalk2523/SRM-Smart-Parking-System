import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersApi } from '../api/users';
import { vehiclesApi } from '../api/vehicles';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Car, 
  Save, 
  Key, 
  LogOut, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }

    const loadVehicles = async () => {
      try {
        const res = await vehiclesApi.getAll();
        setVehicles(res.data || []);
      } catch (err) {
        console.error('Failed to load vehicles', err);
      }
    };

    loadVehicles();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await usersApi.updateProfile(formData);
      if (res.data) {
        updateUser(res.data);
      }
      success('Profile details updated successfully!');
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <User className="w-3.5 h-3.5" />
            Driver Profile & Identity
          </span>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Account Settings</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage your personal profile, vehicle affiliations, and authentication credentials.
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Overview */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl card-surface border border-[var(--border)] space-y-4 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-secondary)] border-2 border-[var(--border)] p-1 mx-auto">
              <div className="w-full h-full rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-text)] text-2xl font-black">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{user?.fullName || 'User'}</h3>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{user?.email}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold badge-neutral">
                {user?.roleName === 'ROLE_ADMIN' ? 'SRM Admin' : 'Campus Driver'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold badge-available flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>
          </div>

          {/* Quick Vehicle Garage Summary */}
          <div className="p-5 rounded-2xl card-surface border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-500" />
                <span>Garage ({vehicles.length})</span>
              </h4>
              <Link to="/vehicles" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Manage
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No vehicles registered yet.</p>
            ) : (
              <div className="space-y-2">
                {vehicles.slice(0, 3).map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[var(--text-primary)] font-mono">{v.licensePlate}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{v.vehicleType} • {v.make || 'Vehicle'}</div>
                    </div>
                    {v.isDefault && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Edit Profile Form & Security */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 space-y-6"
        >
          {/* Edit Information Form */}
          <div className="p-6 sm:p-8 rounded-2xl card-surface border border-[var(--border)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Personal Information</span>
              </h3>
              <span className="text-xs text-[var(--text-muted)]">Verified Account</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl app-input text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Email Address (Immutable)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl app-input opacity-70 cursor-not-allowed font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl app-input text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security & Token Info */}
          <div className="p-6 rounded-2xl card-surface border border-[var(--border)] space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Security & Encryption</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1">
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Password Security</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px]">
                  Protected with BCrypt 10-round salted hash. Never stored plaintext.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1">
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Stateless Session</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px]">
                  Cryptographically signed JWT Bearer authentication token.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};
