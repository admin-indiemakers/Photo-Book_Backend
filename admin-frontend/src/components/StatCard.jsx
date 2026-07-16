import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, accent = 'brand', trend }) {
  const accentClasses = {
    brand: 'bg-cream text-brand-500 border border-border',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    info: 'bg-info/10 text-info border border-info/20',
  };

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
      }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }}
      className="flex flex-col justify-between rounded-sm border border-border bg-white p-6 shadow-paper transition-shadow"
    >
      <div className="flex items-start justify-between">
        <p className="font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${accentClasses[accent]}`}>
          <Icon size={14} strokeWidth={2} />
        </div>
      </div>
      <div className="mt-4">
        <p className="font-editorial text-3xl font-normal text-ink">{value}</p>
        {trend && <p className="mt-2 font-functional text-[10px] text-muted">{trend}</p>}
      </div>
    </motion.div>
  );
}
