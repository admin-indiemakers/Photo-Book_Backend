import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import ProductModal from '../components/ProductModal.jsx';
import api from '../lib/api.js';

const CATEGORIES = [
  { value: 'all', label: 'All products' },
  { value: 'polaroid', label: 'Polaroids' },
  { value: 'photo_frame', label: 'Photo Frames' },
  { value: 'photo_canvas', label: 'Photo Canvas' },
  { value: 'fridge_magnet', label: 'Fridge Magnets' },
  { value: 'acrylic_frame', label: 'Acrylic Frames' },
  { value: 'photo_book', label: 'Photo Books' },
];

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  function load() {
    setLoading(true);
    const params = {};
    if (category !== 'all') params.category = category;
    api
      .get('/products', { params })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }

  useEffect(load, [category]);

  function openAdd() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await api.delete(`/products/${product.id}`);
    load();
  }

  function handleSaved() {
    setModalOpen(false);
    load();
  }

  return (
    <AdminLayout
      title="Products"
      subtitle={`${products.length} product${products.length === 1 ? '' : 's'} shown`}
      headerExtra={
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add product
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition ${
              category === c.value ? 'bg-brand-500 text-white' : 'bg-white text-muted hover:bg-brand-50 hover:text-brand-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center py-14 text-center">
          <ImageOff size={28} className="mb-3 text-muted" />
          <p className="font-medium text-ink">No products in this category yet.</p>
          <p className="mt-1 text-sm text-muted">Add your first product to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="card !p-3">
              {/* Signature: polaroid-style thumbnail with thick white bottom border */}
              <div className="rounded-xl bg-white p-2 pb-6 shadow-soft">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-cream">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff size={28} className="text-border" />
                  )}
                </div>
              </div>

              <div className="mt-3 px-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight text-ink">{p.name}</p>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      p.is_active ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'
                    }`}
                  >
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs capitalize text-muted">{p.category.replace('_', ' ')}</p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="font-display text-base font-bold text-brand-600">{formatCurrency(p.base_price)}</p>
                  <p className={`text-xs font-medium ${p.stock_quantity < 10 ? 'text-warning' : 'text-muted'}`}>
                    {p.stock_quantity} in stock
                  </p>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="btn-secondary flex-1 !py-1.5 text-xs">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p)} className="btn-danger !py-1.5 !px-2.5 text-xs">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductModal product={editingProduct} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      )}
    </AdminLayout>
  );
}
