import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Car, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const Register = () => {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    initialVehiclePlate: '',
    initialVehicleType: 'CAR',
    initialVehicleMake: '',
    initialVehicleModel: '',
  });

  const [hasVehicle, setHasVehicle] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      if (hasVehicle && formData.initialVehiclePlate) {
        payload.initialVehiclePlate = formData.initialVehiclePlate.toUpperCase().trim();
        payload.initialVehicleType = formData.initialVehicleType;
        payload.initialVehicleMake = formData.initialVehicleMake;
        payload.initialVehicleModel = formData.initialVehicleModel;
      }

      const user = await register(payload);
      success(`Welcome to SRM SmartPark, ${user.fullName}!`);
      navigate('/explore');
    } catch (err) {
      error(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg space-y-6"
      >
        
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <BrandLogo size="lg" className="justify-center mb-3" />
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            Register for SRM Campus Parking
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Kattankulathur Campus Student, Faculty, Staff or Visitor Access
          </p>
        </div>

        {/* Registration Card */}
        <div className="card-surface p-6 sm:p-8 rounded-2xl space-y-6 border border-[var(--border)] shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name & Phone in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Aarav Sundaram"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl app-input text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="+919876543299"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl app-input text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@srmist.edu.in"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl app-input text-xs font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl app-input text-xs font-medium"
                />
              </div>
            </div>

            {/* Optional Initial Vehicle Section */}
            <div className="pt-3 border-t border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-[var(--text-primary)]" /> Register Initial Vehicle
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    checked={hasVehicle}
                    onChange={(e) => setHasVehicle(e.target.checked)}
                    className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                  />
                  <span>Add now</span>
                </label>
              </div>

              {hasVehicle && (
                <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Plate Number
                      </label>
                      <input
                        type="text"
                        name="initialVehiclePlate"
                        value={formData.initialVehiclePlate}
                        onChange={handleChange}
                        placeholder="TN-19-AX-4021"
                        className="w-full px-2.5 py-1.5 rounded-lg app-input text-xs font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Vehicle Type
                      </label>
                      <select
                        name="initialVehicleType"
                        value={formData.initialVehicleType}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 rounded-lg app-input text-xs font-medium"
                      >
                        <option value="CAR">Car</option>
                        <option value="BIKE">Two-Wheeler / Bike</option>
                        <option value="EV">Electric Vehicle (EV)</option>
                        <option value="SUV">SUV</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="initialVehicleMake"
                      value={formData.initialVehicleMake}
                      onChange={handleChange}
                      placeholder="Make (e.g. Honda)"
                      className="w-full px-2.5 py-1.5 rounded-lg app-input text-xs placeholder-[var(--text-muted)]"
                    />
                    <input
                      type="text"
                      name="initialVehicleModel"
                      value={formData.initialVehicleModel}
                      onChange={handleChange}
                      placeholder="Model (e.g. City)"
                      className="w-full px-2.5 py-1.5 rounded-lg app-input text-xs placeholder-[var(--text-muted)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="btn-primary w-full mt-2 py-3 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[var(--accent-text)]/20 border-t-[var(--accent-text)] rounded-full animate-spin" />
                  Creating Campus Account...
                </span>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

          </form>

          <div className="text-center text-xs text-[var(--text-muted)]">
            Already have a campus account?{' '}
            <Link to="/login" className="font-bold text-[var(--text-primary)] underline">
              Sign In
            </Link>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
