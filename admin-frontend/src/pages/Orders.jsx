import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import api from '../lib/api.js';

const STATUS_OPTIONS = [
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' }
];

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 50 }; 
    if (search) params.search = search;

    const timeout = setTimeout(() => {
      api
        .get('/orders', { params })
        .then((res) => {
          setOrders(res.data.orders);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const updateStatus = async (orderId, newStatus) => {
    const originalOrder = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: originalOrder.status } : o));
    }
  };

  return (
    <AdminLayout title="Order Management" subtitle="View and manage all customer orders">
      <div className="mb-10 flex items-center justify-between border-b border-border pb-4">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="w-full bg-transparent pl-8 py-2 text-sm font-functional text-ink placeholder:text-muted focus:outline-none"
            placeholder="Search manifest by order number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-border shadow-paper rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-functional text-ink">
            <thead className="bg-cream/50 border-b border-border text-[10px] uppercase tracking-widest text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Delivery Details</th>
                <th className="px-6 py-4 font-semibold">Products</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-y border-ink" />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted font-functional text-xs uppercase tracking-widest">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={o.id} 
                    className="hover:bg-cream/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-editorial text-base text-ink">{o.order_number}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted mt-1">
                        {new Date(o.placed_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-ink">{o.customers?.full_name || 'Guest User'}</div>
                      <div className="text-xs text-ink/80 truncate mt-1">
                        {o.shipping_address?.address_line1 || 'No Address'}, {o.shipping_address?.city || ''}
                      </div>
                      <div className="text-xs text-ink/80 truncate">
                        {o.shipping_address?.phone || o.customers?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-ink">
                        {o.order_items?.length || 0} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 font-editorial font-bold text-brand-600 text-base">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`text-xs border border-border rounded-sm px-2 py-1 focus:outline-none focus:border-ink ${
                          o.status === 'delivered' ? 'bg-success/10 text-success border-success/20' :
                          o.status === 'pending' ? 'bg-brand-500/10 text-brand-600 border-brand-500/20' :
                          o.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                          'bg-cream text-ink'
                        }`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/orders/${o.id}`)}
                        className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-1.5 font-functional text-[10px] font-bold uppercase tracking-widest text-white shadow-md transition-colors hover:bg-ink/80"
                      >
                        <Eye size={14} /> View Detail
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
