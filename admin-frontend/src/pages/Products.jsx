import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import ProductModal from '../components/ProductModal.jsx';
import { PrintCanvas } from '../components/ui/PrintCanvas.jsx';
import api from '../lib/api.js';

const CATEGORIES = [
  { value: 'all', label: 'All Collection' },
  { value: 'polaroid', label: 'Polaroids' },
  { value: 'photo_frame', label: 'Photo Frames' },
  { value: 'photo_canvas', label: 'Photo Canvas' },
  { value: 'fridge_magnet', label: 'Fridge Magnets' },
  { value: 'acrylic_frame', label: 'Acrylic Frames' },
  { value: 'photo_book', label: 'Photo Books' },
];

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
      title="Products Management"
      subtitle="Curate and manage your physical assets"
      headerExtra={
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> New Asset
        </button>
      }
    >
      {/* Editorial Category Filter */}
      <div className="mb-10 flex flex-wrap gap-4 border-b border-border pb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`pb-2 text-xs font-functional uppercase tracking-widest transition-all ${
              category === c.value 
                ? 'border-b-2 border-ink text-ink font-bold' 
                : 'border-b-2 border-transparent text-muted hover:text-ink'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
        </div>
      ) : (
        <PrintCanvas 
          products={products} 
          onEdit={openEdit} 
          onDelete={handleDelete} 
        />
      )}

      {modalOpen && (
        <ProductModal product={editingProduct} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      )}
    </AdminLayout>
  );
}
