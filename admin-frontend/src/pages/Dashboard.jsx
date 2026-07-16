import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, ShoppingBag, Users, Package, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import StatCard from '../components/StatCard.jsx';
import api from '../lib/api.js';

const STATUS_COLORS = {
  pending: '#E85D2C', // Brand Orange for pending (action required)
  confirmed: '#8A7B6E',
  processing: '#2B2420', // Ink for processing
  shipped: '#E85D2C',
  delivered: '#2F9E64',
  cancelled: '#D8483B',
};

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

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
    <AdminLayout title="Overview" subtitle="Executive summary & store performance">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-brand-500" />
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Daily Revenue" value={formatCurrency(summary.revenue_today)} icon={IndianRupee} accent="brand" />
            <StatCard label="Orders Today" value={summary.orders_today} icon={ShoppingBag} accent="info" />
            <StatCard label="Pending Manifests" value={summary.pending_orders} icon={AlertTriangle} accent="warning" />
            <StatCard label="Total Reach" value={summary.total_customers} icon={Users} accent="success" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.div variants={itemVariants} className="rounded-sm border border-border bg-white shadow-paper lg:col-span-2">
              <div className="border-b border-border bg-cream/30 px-6 py-4">
                <h3 className="font-editorial text-lg text-ink">Financial Trajectory</h3>
                <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-1">Rolling 14-day revenue performance</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={summary.revenue_by_day}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E85D2C" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#E85D2C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(5)}
                      tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#8A7B6E' }}
                      axisLine={{ stroke: '#E5E5E5' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#8A7B6E' }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip
                      formatter={(v) => formatCurrency(v)}
                      contentStyle={{ borderRadius: 2, border: '1px solid #E5E5E5', fontSize: 12, fontFamily: 'Inter', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#E85D2C" strokeWidth={2} fill="url(#revenueFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-sm border border-border bg-white shadow-paper">
              <div className="border-b border-border bg-cream/30 px-6 py-4">
                <h3 className="font-editorial text-lg text-ink">Fulfillment Status</h3>
                <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-1">30-day pipeline distribution</p>
              </div>
              <div className="p-6">
                {statusData.length === 0 ? (
                  <p className="font-functional text-xs text-muted text-center py-10">No orders yet.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">
                          {statusData.map((entry) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#8A7B6E'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #E5E5E5', fontSize: 12, fontFamily: 'Inter', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {statusData.map((s) => (
                        <div key={s.status} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-functional text-[11px] uppercase tracking-wider text-muted">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[s.status] || '#8A7B6E' }}
                            />
                            {s.status}
                          </span>
                          <span className="font-functional text-xs font-bold text-ink">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div variants={itemVariants} className="rounded-sm border border-border bg-white shadow-paper">
              <div className="border-b border-border bg-cream/30 px-6 py-4">
                <h3 className="font-editorial text-lg text-ink">Top Publications</h3>
                <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-1">Best-selling configurations</p>
              </div>
              <div className="p-6 space-y-4">
                {topProducts.length === 0 && <p className="font-functional text-xs text-muted text-center">No sales data yet.</p>}
                {topProducts.map((p) => (
                  <div key={p.product_name} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-editorial text-base text-ink">{p.product_name}</p>
                      <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-1">{p.category.replace('_', ' ')} · {p.units_sold} Units</p>
                    </div>
                    <p className="font-functional text-sm font-bold text-brand-500">{formatCurrency(p.revenue)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-sm border border-border bg-white shadow-paper">
              <div className="border-b border-border bg-cream/30 px-6 py-4 flex items-center gap-2">
                <Package size={16} className="text-warning" />
                <div>
                  <h3 className="font-editorial text-lg text-ink">Inventory Alerts</h3>
                  <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-1">Products requiring restock</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {summary.low_stock_products.length === 0 && (
                  <p className="font-functional text-xs text-muted text-center">All products are well stocked.</p>
                )}
                {summary.low_stock_products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <p className="font-editorial text-base text-ink">{p.name}</p>
                    <span className="rounded-sm bg-warning/10 border border-warning/20 px-2 py-1 font-functional text-[10px] uppercase tracking-widest font-bold text-warning">
                      {p.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
