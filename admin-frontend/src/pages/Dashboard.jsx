import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, ShoppingBag, Users, Package, AlertTriangle } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import StatCard from '../components/StatCard.jsx';
import api from '../lib/api.js';

const STATUS_COLORS = {
  pending: '#E4A72D',
  confirmed: '#3B82C4',
  processing: '#E85D2C',
  shipped: '#3B82C4',
  delivered: '#2F9E64',
  cancelled: '#D8483B',
};

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/summary'), api.get('/dashboard/top-products')])
      .then(([s, t]) => {
        setSummary(s.data);
        setTopProducts(t.data.top_products);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusData = summary
    ? Object.entries(summary.status_breakdown).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <AdminLayout title="Overview" subtitle="Here's how the store is performing.">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue today" value={formatCurrency(summary.revenue_today)} icon={IndianRupee} accent="brand" />
            <StatCard label="Orders today" value={summary.orders_today} icon={ShoppingBag} accent="info" />
            <StatCard label="Pending orders" value={summary.pending_orders} icon={AlertTriangle} accent="warning" />
            <StatCard label="Total customers" value={summary.total_customers} icon={Users} accent="success" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="card lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-ink">Revenue — last 14 days</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={summary.revenue_by_day}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E85D2C" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#E85D2C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    tick={{ fontSize: 11, fill: '#8A7B6E' }}
                    axisLine={{ stroke: '#F0E4D8' }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#8A7B6E' }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{ borderRadius: 12, border: '1px solid #F0E4D8', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#E85D2C" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="mb-4 text-sm font-semibold text-ink">Orders by status (30d)</h3>
              {statusData.length === 0 ? (
                <p className="text-sm text-muted">No orders yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#8A7B6E'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0E4D8', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-3 space-y-1.5">
                {statusData.map((s) => (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 capitalize text-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[s.status] || '#8A7B6E' }}
                      />
                      {s.status}
                    </span>
                    <span className="font-semibold text-ink">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="card">
              <h3 className="mb-4 text-sm font-semibold text-ink">Top-selling products</h3>
              <div className="space-y-3">
                {topProducts.length === 0 && <p className="text-sm text-muted">No sales data yet.</p>}
                {topProducts.map((p) => (
                  <div key={p.product_name} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-ink">{p.product_name}</p>
                      <p className="text-xs capitalize text-muted">{p.category.replace('_', ' ')} · {p.units_sold} sold</p>
                    </div>
                    <p className="text-sm font-bold text-brand-600">{formatCurrency(p.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
                <Package size={16} className="text-warning" />
                Low stock alerts
              </h3>
              <div className="space-y-3">
                {summary.low_stock_products.length === 0 && (
                  <p className="text-sm text-muted">All products are well stocked.</p>
                )}
                {summary.low_stock_products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                      {p.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
