import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import api from '../lib/api.js';

const LIMIT = 15;

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .get('/customers', { params: { page, limit: LIMIT, search: search || undefined } })
        .then((res) => {
          setCustomers(res.data.customers);
          setTotal(res.data.total);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <AdminLayout title="Customers Management" subtitle={`${total} client profiles in the registry`}>
      <div className="mb-8 relative w-full max-w-sm">
        <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="w-full bg-transparent pl-8 py-2 text-sm font-functional text-ink placeholder:text-muted focus:outline-none border-b border-border/50 focus:border-ink transition-colors"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-sm border border-border bg-white shadow-paper overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-cream/60 px-6 py-4">
          <div className="col-span-4 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Primary Contact</div>
          <div className="col-span-3 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Location</div>
          <div className="col-span-2 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted text-center">Orders</div>
          <div className="col-span-2 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted text-right">Lifetime Spend</div>
          <div className="col-span-1 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted text-right">Action</div>
        </div>

        <div className="divide-y divide-border/50">
          {loading ? (
             <div className="flex h-32 items-center justify-center">
               <div className="h-6 w-6 animate-spin rounded-full border-y border-ink" />
             </div>
          ) : customers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-functional text-xs uppercase tracking-widest text-muted">No client profiles found</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {customers.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 cursor-pointer hover:bg-cream/40 transition-colors group"
                >
                  <div className="col-span-4">
                    <p className="font-editorial text-lg text-ink group-hover:text-brand-600 transition-colors">{c.full_name}</p>
                    <p className="font-functional text-[11px] text-muted mt-1">{c.email}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="font-functional text-xs text-ink">{c.city ? `${c.city}, ${c.state || ''}` : c.phone || 'Location not provided'}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cream font-functional text-xs font-semibold text-ink border border-border">
                      {c.order_count}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="font-functional text-sm font-bold text-ink">{formatCurrency(c.total_spent)}</p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/customers/${c.id}`); }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-1.5 font-functional text-[10px] font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-ink/80"
                    >
                      <Eye size={12} /> View
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between font-functional text-[10px] uppercase tracking-widest text-muted">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-4">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage((p) => p - 1)} 
            className="flex items-center gap-1 hover:text-ink transition-colors disabled:opacity-40 disabled:hover:text-muted"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage((p) => p + 1)} 
            className="flex items-center gap-1 hover:text-ink transition-colors disabled:opacity-40 disabled:hover:text-muted"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
