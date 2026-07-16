import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <AdminLayout title="Customers" subtitle={`${total} customer${total === 1 ? '' : 's'} in total`}>
      <div className="mb-5 relative w-full max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input-field pl-9"
          placeholder="Search name, email or phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="card overflow-hidden !p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-cream/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Location</th>
              <th className="px-5 py-3 font-semibold">Orders</th>
              <th className="px-5 py-3 font-semibold">Lifetime spend</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  Loading customers…
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-brand-50/40"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{c.full_name}</p>
                    <p className="text-xs text-muted">{c.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{c.city ? `${c.city}, ${c.state}` : '—'}</td>
                  <td className="px-5 py-3.5 font-medium text-ink">{c.order_count}</td>
                  <td className="px-5 py-3.5 font-semibold text-ink">{formatCurrency(c.total_spent)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.is_blocked ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                      }`}
                    >
                      {c.is_blocked ? 'Blocked' : 'Active'}
                    </span>
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
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-3 !py-1.5 disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-3 !py-1.5 disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
