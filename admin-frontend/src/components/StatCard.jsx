export default function StatCard({ label, value, icon: Icon, accent = 'brand', trend }) {
  const accentClasses = {
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
  };

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
        {trend && <p className="mt-1 text-xs text-muted">{trend}</p>}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
    </div>
  );
}
