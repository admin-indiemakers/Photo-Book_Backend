import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import api from '../lib/api.js';

export default function Carts() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/carts', { params: { limit: 50 } })
      .then((res) => {
        setCarts(res.data.carts || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Cart Management" subtitle="Live view of customer shopping carts">
      <div className="rounded-sm border border-border bg-white shadow-paper overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-cream/60 px-6 py-4">
          <div className="col-span-3 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Customer</div>
          <div className="col-span-5 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Products Added</div>
          <div className="col-span-2 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted text-right">Total Value</div>
          <div className="col-span-2 font-functional text-[10px] font-semibold uppercase tracking-[0.2em] text-muted text-right">Last Active</div>
        </div>

        <div className="divide-y divide-border/50">
          {loading ? (
             <div className="flex h-32 items-center justify-center">
               <div className="h-6 w-6 animate-spin rounded-full border-y border-ink" />
             </div>
          ) : carts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-functional text-xs uppercase tracking-widest text-muted">No active carts found</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {carts.map((cart, i) => {
                const items = cart.cart_items || [];
                const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                return (
                  <motion.div
                    key={cart.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-12 gap-4 items-start px-6 py-4 hover:bg-cream/40 transition-colors"
                  >
                    <div className="col-span-3">
                      <p className="font-editorial text-lg text-ink">{cart.customers?.full_name || 'Anonymous'}</p>
                      <p className="font-functional text-[11px] text-muted mt-1">{cart.customers?.email || 'No email'}</p>
                    </div>
                    
                    <div className="col-span-5 space-y-2">
                      {items.length === 0 ? (
                        <span className="text-sm text-muted italic">Empty Cart</span>
                      ) : (
                        items.map((item) => (
                          <div key={item.id} className="flex gap-2 items-center text-sm text-ink">
                            <span className="inline-flex items-center justify-center bg-brand-50 text-brand-600 rounded px-1.5 py-0.5 text-[10px] font-bold">
                              {item.quantity}x
                            </span>
                            <span className="truncate max-w-[200px]">{item.products?.name || 'Unknown Product'}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="col-span-2 text-right">
                      <p className="font-functional text-sm font-bold text-ink">₹{totalValue.toFixed(2)}</p>
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <p className="font-functional text-xs text-muted">
                        {new Date(cart.updated_at).toLocaleDateString()}
                      </p>
                      <p className="font-functional text-[10px] text-muted">
                        {new Date(cart.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
