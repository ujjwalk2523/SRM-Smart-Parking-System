import React from 'react';
import { CheckCircle2, Clock, Car, MapPin, Receipt, X, Printer } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session) return null;

  const formatDateTime = (dt) => {
    if (!dt) return 'N/A';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl modal-surface border border-[var(--border)] shadow-2xl overflow-hidden">
        
        {/* Receipt Header Banner */}
        <div className="p-6 bg-emerald-500/10 text-center border-b border-[var(--border)]">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Parking Settled</h2>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
            Payment Completed • Bay Released to Grid
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-3">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Booking Reference</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{session.bookingReference || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Session Code</span>
              <span className="font-mono text-[var(--text-secondary)]">{session.sessionCode}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Vehicle</span>
              <span className="font-bold text-[var(--text-primary)]">{session.licensePlate} ({session.vehicleType})</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Parking Bay</span>
              <span className="font-bold text-[var(--text-primary)]">{session.slotNumber}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Facility</span>
              <span className="text-[var(--text-secondary)]">{session.lotName}</span>
            </div>
          </div>

          {/* Timing Box */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Checked In</span>
              <span className="font-semibold text-[var(--text-primary)]">{formatDateTime(session.checkInTime)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Checked Out</span>
              <span className="font-semibold text-[var(--text-primary)]">{formatDateTime(session.checkOutTime)}</span>
            </div>
          </div>

          {/* Duration & Charges Breakdown */}
          <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Total Duration</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {session.totalDurationMinutes} mins ({Math.ceil((session.totalDurationMinutes || 0) / 60)} hrs)
              </span>
            </div>

            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Calculated Tariff</span>
              <span className="font-semibold text-[var(--text-primary)]">₹{session.calculatedFare}</span>
            </div>

            {session.overstayPenalty > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                <span>Overstay Penalty</span>
                <span>+ ₹{session.overstayPenalty}</span>
              </div>
            )}

            <div className="pt-2 border-t border-[var(--border)] flex justify-between items-baseline font-bold text-base text-[var(--text-primary)]">
              <span>Amount Paid</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-lg">₹{session.paidAmount || session.calculatedFare}</span>
            </div>

            {session.transactionId && (
              <div className="flex justify-between text-[11px] text-[var(--text-muted)] pt-1">
                <span>Txn ID: {session.transactionId}</span>
                <span>Method: {session.paymentMethod || 'UPI'}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>

          <button
            onClick={onClose}
            className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
