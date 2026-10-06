import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vehiclesApi } from '../api/vehicles';
import { useToast } from '../context/ToastContext';
import { 
  Car, 
  Bike, 
  Zap, 
  Plus, 
  Star, 
  Trash2, 
  Check, 
  AlertCircle,
  X,
  Bus
} from 'lucide-react';

export const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: 'CAR',
    make: '',
    model: '',
    color: '',
    isDefault: false,
  });

  const { success, error } = useToast();

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehiclesApi.getMyVehicles();
      setVehicles(res.data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load vehicles from garage.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await vehiclesApi.addVehicle({
        ...formData,
        licensePlate: formData.licensePlate.toUpperCase().trim(),
      });
      success(`Vehicle ${formData.licensePlate.toUpperCase()} added to garage!`);
      setModalOpen(false);
      setFormData({
        licensePlate: '',
        vehicleType: 'CAR',
        make: '',
        model: '',
        color: '',
        isDefault: false,
      });
      loadVehicles();
    } catch (err) {
      error(err.message || 'Failed to add vehicle. Plate might already be registered.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (vehicleId) => {
    try {
      await vehiclesApi.setDefault(vehicleId);
      success('Default parking vehicle updated.');
      loadVehicles();
    } catch (err) {
      error(err.message || 'Failed to update default vehicle.');
    }
  };

  const handleDelete = async (vehicleId, plate) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${plate}?`)) {
      return;
    }

    try {
      await vehiclesApi.deleteVehicle(vehicleId);
      success(`Vehicle ${plate} removed from garage.`);
      loadVehicles();
    } catch (err) {
      error(err.message || 'Failed to delete vehicle.');
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'BIKE': return <Bike className="w-5 h-5 text-emerald-500" />;
      case 'EV': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'BUS': return <Bus className="w-5 h-5 text-purple-500" />;
      default: return <Car className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
            Garage Management
          </span>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            My Registered Vehicles
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage your registered cars, two-wheelers, EVs, and campus passes for barrier allocation.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </motion.button>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]" />
          ))}
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v, idx) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
              className={`card-surface card-surface-hover p-6 rounded-2xl flex flex-col justify-between gap-4 relative transition-all border border-[var(--border)] ${
                v.default ? 'ring-2 ring-[var(--border-focus)]' : ''
              }`}
            >
              {/* Default Badge */}
              {v.default && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] text-[10px] font-bold border border-[var(--border)]">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Primary</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                    {getVehicleIcon(v.vehicleType)}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                      {v.vehicleType}
                    </span>
                    <h3 className="font-mono text-base font-bold text-[var(--text-primary)] tracking-wider">
                      {v.licensePlate}
                    </h3>
                  </div>
                </div>

                <div className="text-xs text-[var(--text-muted)] space-y-0.5">
                  <p className="font-semibold text-[var(--text-secondary)]">
                    {v.make || 'Make unspecified'} {v.model || ''}
                  </p>
                  {v.color && <p>Color: {v.color}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                {!v.default ? (
                  <button
                    onClick={() => handleSetDefault(v.id)}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold transition-colors cursor-pointer"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Primary Vehicle
                  </span>
                )}

                <button
                  onClick={() => handleDelete(v.id, v.licensePlate)}
                  title="Remove vehicle"
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl card-surface border border-dashed border-[var(--border)] space-y-3">
          <Car className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">Your garage is currently empty</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Register your vehicle plate numbers to effortlessly reserve parking bays across SRM campus.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary mt-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Add First Vehicle
          </button>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl modal-surface shadow-2xl p-6 space-y-6 border border-[var(--border)]"
            >
              
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">Add Vehicle to Garage</h3>
                  <p className="text-xs text-[var(--text-muted)]">Assign your car, bike, or EV</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                    License Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="TN-19-AX-4021"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl app-input font-mono uppercase text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                    Vehicle Category *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl app-input text-xs font-medium"
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Motorcycle / Scooter</option>
                    <option value="SUV">SUV</option>
                    <option value="EV">Electric Vehicle (EV)</option>
                    <option value="BUS">Bus / Heavy Transport</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                      Make
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Honda"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl app-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. City"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl app-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. White, Metallic Black"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl app-input text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)] pt-1">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                  />
                  <span>Set as default vehicle for bookings</span>
                </label>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className="btn-primary w-full py-3 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Save Vehicle'}
                </motion.button>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
