import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2 } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
    try {
      await api.patch(`/customers/${id}`, { is_blocked: !customer.is_blocked });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    setSaving(true);
    try {
      await api.patch(`/customers/${id}`, { notes });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !customer) {
    return (
      <AdminLayout title="Customer details">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        </div>
      </AdminLayout>
    );
  }

  const lifetimeSpend = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <AdminLayout title={customer.full_name} subtitle={customer.email}>
      <button onClick={() => navigate('/customers')} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand-600">
        <ArrowLeft size={16} /> Back to customers
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold text-ink">Order history ({orders.length})</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-muted">This customer hasn't placed any orders yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    to={`/orders/${o.id}`}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-brand-50/30"
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-ink">{o.order_number}</p>
                      <p className="text-xs text-muted">{new Date(o.placed_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ink">{formatCurrency(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Internal notes</h3>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Notes about this customer, only visible to admins…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={saveNotes} disabled={saving} className="btn-secondary mt-3">
              Save note
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Contact</h3>
            <p className="text-sm text-muted">Phone</p>
            <p className="mb-2 text-sm font-medium text-ink">{customer.phone || '—'}</p>
            <p className="text-sm text-muted">Address</p>
            <p className="text-sm font-medium text-ink">
              {customer.address_line1 ? `${customer.address_line1}, ` : ''}
              {customer.city ? `${customer.city}, ${customer.state} ${customer.postal_code}` : '—'}
            </p>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Lifetime value</h3>
            <p className="font-display text-2xl font-bold text-brand-600">{formatCurrency(lifetimeSpend)}</p>
            <p className="text-xs text-muted">across {orders.length} order{orders.length === 1 ? '' : 's'}</p>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Account status</h3>
            <p className="mb-3 text-sm text-muted">
              {customer.is_blocked
                ? 'This customer is currently blocked from placing new orders.'
                : 'This customer can place orders normally.'}
            </p>
            <button
              onClick={toggleBlock}
              disabled={saving}
              className={customer.is_blocked ? 'btn-secondary w-full' : 'btn-danger w-full'}
            >
              {customer.is_blocked ? (
                <>
                  <CheckCircle2 size={16} /> Unblock customer
                </>
              ) : (
                <>
                  <Ban size={16} /> Block customer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
