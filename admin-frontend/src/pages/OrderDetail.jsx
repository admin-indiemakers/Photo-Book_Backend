import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import FilmStepper from '../components/FilmStepper.jsx';
import api from '../lib/api.js';

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};
const NEXT_LABEL = {
  pending: 'Confirm order',
  confirmed: 'Start processing',
  processing: 'Mark as shipped',
  shipped: 'Mark as delivered',
};

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [tracking, setTracking] = useState('');
  const [courier, setCourier] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data.order);
        setItems(res.data.items);
        setHistory(res.data.history);
        setTracking(res.data.order.tracking_number || '');
        setCourier(res.data.order.courier_name || '');
        setNotes(res.data.order.admin_notes || '');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function advanceStatus() {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: next });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function cancelOrder() {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: 'cancelled' });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function saveShipping() {
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/status`, { tracking_number: tracking, courier_name: courier });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/notes`, { admin_notes: notes });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !order) {
    return (
      <AdminLayout title="Order details">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Order ${order.order_number}`} subtitle={`Placed on ${new Date(order.placed_at).toLocaleString('en-IN')}`}>
      <button onClick={() => navigate('/orders')} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand-600">
        <ArrowLeft size={16} /> Back to orders
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Fulfillment progress</h3>
              <StatusBadge status={order.status} />
            </div>
            <FilmStepper status={order.status} />

            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="mt-4 flex gap-2">
                <button onClick={advanceStatus} disabled={saving} className="btn-primary">
                  {NEXT_LABEL[order.status]}
                </button>
                <button onClick={cancelOrder} disabled={saving} className="btn-danger">
                  Cancel order
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="mb-4 text-sm font-semibold text-ink">Items ({items.length})</h3>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.product_name}</p>
                    <p className="text-xs capitalize text-muted">
                      {item.category.replace('_', ' ')}
                      {item.customization?.size ? ` · ${item.customization.size}` : ''}
                      {item.customization?.material ? ` · ${item.customization.material}` : ''}
                    </p>
                    {item.customization?.photo_url && (
                      <a
                        href={item.customization.photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-brand-600 underline"
                      >
                        View uploaded photo
                      </a>
                    )}
                    {item.customization?.pdfData && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const blob = new Blob([JSON.stringify(item.customization.pdfData, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `photobook-layout-${item.id}.json`;
                          a.click();
                        }}
                        className="mt-1 inline-block text-xs font-medium text-brand-600 underline"
                      >
                        Download Photobook Layout (JSON)
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">{formatCurrency(item.line_total)}</p>
                    <p className="text-xs text-muted">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold text-ink">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <Truck size={16} className="text-brand-500" />
              Shipping details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">Courier</label>
                <input className="input-field" value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. Delhivery" />
              </div>
              <div>
                <label className="label-text">Tracking number</label>
                <input className="input-field" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. TRK123456" />
              </div>
            </div>
            <button onClick={saveShipping} disabled={saving} className="btn-secondary mt-3">
              Save shipping info
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Customer</h3>
            <Link to={`/customers/${order.customers.id}`} className="text-sm font-semibold text-brand-600 hover:underline">
              {order.customers.full_name}
            </Link>
            <p className="mt-1 text-sm text-muted">{order.customers.email}</p>
            <p className="text-sm text-muted">{order.customers.phone}</p>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Shipping address</h3>
            <p className="text-sm text-ink">
              {order.address_line1 || 'No address provided'}
              {order.address_line2 ? `, ${order.address_line2}` : ''}
            </p>
            <p className="text-sm text-muted">
              {order.city} {order.state ? `, ${order.state}` : ''} {order.postal_code}
            </p>
            <p className="text-sm text-muted">{order.country}</p>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Internal notes</h3>
            <textarea
              className="input-field min-h-[90px] resize-none"
              placeholder="Notes only visible to admins…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={saveNotes} disabled={saving} className="btn-secondary mt-3 w-full">
              Save note
            </button>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Status history</h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="flex items-start gap-2.5 text-sm">
                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="font-medium capitalize text-ink">{h.status.replace('_', ' ')}</p>
                    <p className="text-xs text-muted">
                      {new Date(h.created_at).toLocaleString('en-IN')} {h.admins?.full_name ? `· ${h.admins.full_name}` : ''}
                    </p>
                    {h.note && <p className="mt-0.5 text-xs italic text-muted">"{h.note}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
