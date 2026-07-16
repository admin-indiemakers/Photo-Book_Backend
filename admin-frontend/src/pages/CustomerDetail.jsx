import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import api from '../lib/api.js';

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get(`/customers/${id}`)
      .then((res) => {
        setCustomer(res.data.customer);
        setOrders(res.data.orders);
        setNotes(res.data.customer.notes || '');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleBlock() {
    // Optimistic Update
    const originalStatus = customer.is_blocked;
    setCustomer(prev => ({ ...prev, is_blocked: !originalStatus }));
    
    try {
      await api.patch(`/customers/${id}`, { is_blocked: !originalStatus });
    } catch (err) {
      console.error('Failed to toggle block status:', err);
      // Revert on failure
      setCustomer(prev => ({ ...prev, is_blocked: originalStatus }));
    }
  }

  async function saveNotes() {
    // We could make this perfectly optimistic by debounce saving on stroke,
    // but a button click is fine, we just won't block the UI while saving.
    const currentNotes = notes;
    try {
      await api.patch(`/customers/${id}`, { notes: currentNotes });
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  }

  if (loading || !customer) {
    return (
      <AdminLayout title="Customer details">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-brand-500" />
        </div>
      </AdminLayout>
    );
  }

  const lifetimeSpend = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <AdminLayout title={customer.full_name} subtitle={customer.email}>
      <button onClick={() => navigate('/customers')} className="mb-8 flex items-center gap-1.5 font-functional text-[10px] uppercase tracking-[0.2em] text-muted hover:text-ink transition-colors">
        <ArrowLeft size={14} strokeWidth={2} /> Return to Directory
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-sm border border-border bg-white shadow-paper"
          >
            <div className="border-b border-border bg-cream/30 px-6 py-4 flex items-center justify-between">
              <h3 className="font-editorial text-lg text-ink">Order History</h3>
              <span className="font-functional text-[10px] uppercase tracking-[0.2em] text-muted">{orders.length} Records</span>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-functional text-xs text-muted uppercase tracking-widest">No order records found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50 p-2">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    to={`/orders/${o.id}`}
                    className="flex items-center justify-between p-4 hover:bg-cream/50 transition-colors rounded-sm group"
                  >
                    <div>
                      <p className="font-functional text-xs font-semibold text-ink group-hover:text-brand-600 transition-colors">{o.order_number}</p>
                      <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-1">{new Date(o.placed_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-editorial text-lg text-ink">{formatCurrency(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-sm border border-border bg-white shadow-paper"
          >
            <div className="border-b border-border bg-cream/30 px-6 py-4 flex justify-between items-center">
              <h3 className="font-editorial text-lg text-ink">Internal Notes</h3>
              <button onClick={saveNotes} className="font-functional text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500 hover:text-brand-600">
                Commit Save
              </button>
            </div>
            <div className="p-6">
              <textarea
                className="w-full min-h-[120px] resize-none bg-transparent font-functional text-sm text-ink placeholder:text-muted/50 focus:outline-none border-none p-0"
                placeholder="Document client preferences, special requests, or administrative notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes} // Optimistically save on blur
              />
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-sm border border-border bg-white shadow-paper"
          >
            <div className="border-b border-border bg-cream/30 px-6 py-4">
              <h3 className="font-editorial text-lg text-ink">Contact Dossier</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-functional text-[10px] uppercase tracking-widest text-muted mb-1">Direct Line</p>
                <p className="font-functional text-sm font-medium text-ink">{customer.phone || 'Not Provided'}</p>
              </div>
              <div>
                <p className="font-functional text-[10px] uppercase tracking-widest text-muted mb-1">Registered Address</p>
                <p className="font-functional text-sm font-medium text-ink leading-relaxed">
                  {customer.address_line1 ? `${customer.address_line1}, ` : ''}
                  {customer.city ? `${customer.city}, ${customer.state} ${customer.postal_code}` : 'No Address on File'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-sm border border-border bg-white shadow-paper"
          >
             <div className="border-b border-border bg-cream/30 px-6 py-4">
              <h3 className="font-editorial text-lg text-ink">Lifetime Value</h3>
            </div>
            <div className="p-6 text-center py-8 bg-brand-500/5">
              <p className="font-editorial text-4xl font-bold text-brand-500">{formatCurrency(lifetimeSpend)}</p>
              <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-2">Cumulative Revenue</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-sm border border-border bg-white shadow-paper overflow-hidden"
          >
             <div className="border-b border-border bg-cream/30 px-6 py-4 flex justify-between items-center">
              <h3 className="font-editorial text-lg text-ink">Account Status</h3>
              <div className={`h-2 w-2 rounded-full ${customer.is_blocked ? 'bg-danger' : 'bg-success'}`} />
            </div>
            <div className="p-6 bg-cream/10">
              <p className="mb-4 font-functional text-xs text-muted leading-relaxed">
                {customer.is_blocked
                  ? 'This profile is currently restricted from initiating new transactions on the platform.'
                  : 'This profile is in good standing and holds standard purchasing privileges.'}
              </p>
              <button
                onClick={toggleBlock}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-sm font-functional text-[10px] uppercase tracking-widest font-bold transition-all ${
                  customer.is_blocked 
                    ? 'bg-ink text-white hover:bg-ink/90 shadow-paper' 
                    : 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20'
                }`}
              >
                {customer.is_blocked ? (
                  <>
                    <CheckCircle2 size={14} /> Restore Privileges
                  </>
                ) : (
                  <>
                    <Ban size={14} /> Revoke Privileges
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
