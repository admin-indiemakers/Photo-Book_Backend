import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import api from '../lib/api.js';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const LIMIT = 15;

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (status !== 'all') params.status = status;
    if (search) params.search = search;

    const timeout = setTimeout(() => {
      api
        .get('/orders', { params })
        .then((res) => {
          setOrders(res.data.orders);
          setTotal(res.data.total);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [page, status, search]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <AdminLayout title="Orders" subtitle={`${total} order${total === 1 ? '' : 's'} in total`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-field pl-9"
            placeholder="Search by order number…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                status === s ? 'bg-brand-500 text-white' : 'bg-white text-muted hover:bg-brand-50 hover:text-brand-600'
              } border border-border`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden !p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-cream/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Placed on</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Payment</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted">
                  Loading orders…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted">
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/orders/${o.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-brand-50/40"
                >
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink">{o.order_number}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{o.customers?.full_name}</p>
                    <p className="text-xs text-muted">{o.customers?.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {new Date(o.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-ink">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={o.payment_status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary !px-3 !py-1.5 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary !px-3 !py-1.5 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
