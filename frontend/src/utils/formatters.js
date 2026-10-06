export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  return `₹${Number(amount).toFixed(2)}`;
};

export const formatDateTime = (dt) => {
  if (!dt) return 'N/A';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0 mins';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

export const getSlotStatusColor = (status) => {
  switch (status) {
    case 'AVAILABLE':
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        badge: 'badge-available',
      };
    case 'RESERVED':
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        badge: 'badge-reserved',
      };
    case 'OCCUPIED':
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
        dot: 'bg-rose-500',
        badge: 'badge-occupied',
      };
    case 'MAINTENANCE':
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        badge: 'badge-reserved',
      };
    case 'DISABLED':
    default:
      return {
        bg: 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-muted)]',
        dot: 'bg-[var(--text-muted)]',
        badge: 'badge-neutral',
      };
  }
};
